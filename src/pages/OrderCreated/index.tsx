import React, { useCallback } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  id: number;
}

const OrderCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const { id } = routeParams;

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [
        {
          name: 'MainBottom',
          params: {
            screen: 'Dashboard',
          },
        },
        {
          name: 'OrderDetails',
          params: {
            id,
          },
        },
      ],
      index: 1,
    });
  }, [reset, id]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Pedido realizado com sucesso!</Title>
      <Description>
        O seu pedido já está em preparo, continue para acompanhar o seu pedido.
      </Description>

      <OkButton onPress={handleOkPressed}>
        <OkButtonText>Acompanhar pedido</OkButtonText>
      </OkButton>
    </Container>
  );
};

export default OrderCreated;
