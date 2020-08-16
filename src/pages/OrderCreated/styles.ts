import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
`;

export const Title = styled.Text`
  font-size: 32px;
  color: #f4ede8;
  font-family: 'Poppins-Medium';
  margin-top: 48px;
  text-align: center;
`;

export const Description = styled.Text`
  font-family: 'Poppins-Regular';
  font-size: 18px;
  color: #fff;
  margin-top: 16px;
  text-align: center;

  font-style: normal;
  font-weight: 600;
`;

export const OkButton = styled(RectButton)`
  background: #ffb84d;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  margin-top: 24px;
  padding: 12px 24px;
`;

export const OkButtonText = styled.Text`
  font-family: 'Poppins-Medium';
  font-weight: 600;
  font-size: 15px;
  line-height: 22px;
  color: #7a1818;
  text-align: center;
`;
