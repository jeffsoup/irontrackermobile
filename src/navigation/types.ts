import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Home: undefined;
  AddSet: undefined;
  Workouts: undefined;
  History: undefined;
  Progression: undefined;
  Profile: undefined;
};
