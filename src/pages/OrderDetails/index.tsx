import React, { useEffect, useState, useMemo } from 'react';
import { Image } from 'react-native';

import { useRoute } from '@react-navigation/native';
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
  formattedPrice: string;
}

const OrderDetails: React.FC = () => {
  const [order, setOrder] = useState({} as Order);
  const [extras, setExtras] = useState<Extra[]>([]);

  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadOrder(): Promise<void> {
      const { id } = routeParams;
      const response = await api.get<Order>(`orders/${id}`);
      const responseOrder = response.data;

      const formattedOrder = {
        ...responseOrder,
        formattedPrice: formatValue(responseOrder.price),
      };

      setOrder(formattedOrder);
      setExtras(formattedOrder.extras);
    }

    loadOrder();
  }, [routeParams]);

  const cartTotal = useMemo(() => {
    const totalExtra = extras.reduce((total, extra) => {
      const extraTotal = extra.quantity * extra.value;
      return total + extraTotal;
    }, 0);

    const orderWithExtras = order.price + totalExtra;

    const totalPrice = formatValue(orderWithExtras * order.quantity);

    return totalPrice;
  }, [extras, order.price, order.quantity]);

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
                  uri: order.thumbnail_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{order.name}</FoodTitle>
              <FoodDescription>{order.description}</FoodDescription>
              <FoodPricing>{order.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>

          {extras.length < 1 && (
            <FoodDescription>Nenhum adicional neste pedido.</FoodDescription>
          )}

          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <AdittionalItemText>qtd. {extra.quantity}</AdittionalItemText>
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice>{cartTotal}</TotalPrice>
            <AdittionalItemText>Qtd. de pratos</AdittionalItemText>
            <QuantityContainer>
              <AdittionalItemText>{order.quantity}</AdittionalItemText>
            </QuantityContainer>
          </PriceButtonContainer>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default OrderDetails;
