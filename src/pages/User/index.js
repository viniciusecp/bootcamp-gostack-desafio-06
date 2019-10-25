import React, {Component} from 'react';
import {ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stars: [],
      loading: false,
      page: 1,
      refreshing: false,
      isFetching: false,
    };
  }

  async componentDidMount() {
    const {navigation} = this.props;
    const user = navigation.getParam('user');

    this.setState({loading: true});

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({stars: response.data, loading: false});
  }

  loadMore = async () => {
    const {stars, page} = this.state;
    const {navigation} = this.props;
    const user = navigation.getParam('user');

    this.setState({isFetching: true});

    const nextPage = page + 1;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: nextPage,
      },
    });

    this.setState({
      stars: [...stars, ...response.data],
      page: nextPage,
      isFetching: false,
    });
  };

  refreshList = async () => {
    const {navigation} = this.props;
    const user = navigation.getParam('user');

    this.setState({refreshing: true});

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({stars: response.data, refreshing: false, page: 1});
  };

  handleNavigate = repository => {
    const {navigation} = this.props;
    navigation.navigate('Repository', {repository});
  };

  render() {
    const {navigation} = this.props;
    const {stars, loading, refreshing, isFetching} = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#7159c1" size={64} />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            ListFooterComponent={
              isFetching && <ActivityIndicator size="large" color="#7159c1" />
            }
            onRefresh={this.refreshList}
            refreshing={refreshing}
          />
        )}
      </Container>
    );
  }
}

User.navigationOptions = ({navigation}) => ({
  title: navigation.getParam('user').name,
});

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
};
