import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

interface Order {
  id: number;
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  quantity: number;
  thumbnail_url: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const { id } = routeParams;
      const response = await api.get<Food>(`foods/${id}`);
      const responseFood = response.data;
      const formattedExtras = responseFood.extras.map(extra => ({
        ...extra,
        quantity: 0,
      }));
      const formattedFood = {
        ...responseFood,
        formattedPrice: formatValue(responseFood.price),
      };

      setFood(formattedFood);
      setExtras(formattedExtras);
      api
        .get<Food[]>(`favorites`, {
          params: {
            name: formattedFood.name,
          },
        })
        .then(favoriteResponse => {
          const favorite = favoriteResponse.data[0];
          if (favorite) {
            setIsFavorite(true);
          }
        });
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id) {
        Object.assign(extra, {
          quantity: extra.quantity + 1,
        });
      }

      return extra;
    });

    setExtras(updatedExtras);
  }

  function handleDecrementExtra(id: number): void {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id) {
        if (extra.quantity > 0) {
          Object.assign(extra, {
            quantity: extra.quantity - 1,
          });
        }
      }

      return extra;
    });

    setExtras(updatedExtras);
  }

  function handleIncrementFood(): void {
    setFoodQuantity(oldQuantity => oldQuantity + 1);
  }

  function handleDecrementFood(): void {
    if (foodQuantity > 1) {
      setFoodQuantity(oldQuantity => oldQuantity - 1);
    }
  }

  const toggleFavorite = useCallback(async () => {
    const checked = !isFavorite;
    const response = await api.get<Food[]>('favorites', {
      params: {
        name: food.name,
      },
    });

    const foundFavorite = response.data[0];

    if (checked) {
      if (foundFavorite) {
        setIsFavorite(true);
        return;
      }
      await api.post('favorites', food);
      setIsFavorite(true);
    } else {
      if (foundFavorite) {
        await api.delete(`favorites/${foundFavorite.id}`);
        setIsFavorite(false);
        return;
      }

      setIsFavorite(false);
    }
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const totalExtra = extras.reduce((total, extra) => {
      const extraTotal = extra.quantity * extra.value;
      return Number(total + extraTotal);
    }, 0);

    const foodWithExtras = Number(food.price) + Number(totalExtra);

    const totalPrice = formatValue(foodWithExtras * foodQuantity);

    return totalPrice;
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    if (foodQuantity < 1) {
      Alert.alert('Selecione pelo menos 1 prato para realizar o pedido!');
      return;
    }

    const selectedExtras = extras.filter(extra => extra.quantity > 0);
    const orderFood = {
      product_id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      quantity: foodQuantity,
      thumbnail_url: food.image_url,
      extras: selectedExtras,
    };

    api.post<Order>('/orders', orderFood).then(response => {
      const order = response.data;

      navigation.reset({
        routes: [
          {
            name: 'MainBottom',
            params: {
              screen: 'Dashboard',
            },
          },
          {
            name: 'OrderCreated',
            params: {
              id: order.id,
            },
          },
        ],
        index: 1,
      });
    });
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
