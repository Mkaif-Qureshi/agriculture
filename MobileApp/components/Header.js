import {Text, TouchableOpacity, View} from 'react-native';
import {theme} from '../theme.config';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const Header = ({text}) => {
    const navigation = useNavigation();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10,
        },
      ]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          width: 40,
          height: 40,
          backgroundColor: theme.darkBrown,
          borderRadius: 30,
          opacity: 0.7,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name="arrow-back" size={27} color="black" />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: theme.fs3,
          fontFamily: theme.font.bold,
          color: theme.darkBrown,
          marginTop: 3,
        }}>
        {text}
      </Text>
    </View>
  );
};

export default Header;
