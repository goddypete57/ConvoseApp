import React, {useEffect, useState, useCallback} from 'react';
import {
  FlatList,
  Image,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import colors from './assets/colors/Colors';
import endpoints from './assets/endpoint/EndPoint';

function App(): React.JSX.Element {
  if (Platform.OS === 'ios') {
    StatusBar.setBarStyle('dark-content', true);
  }

  const [search, setSearch] = useState('');
  const [allInterests, setAllInterests] = useState([]);
  const [filteredInterests, setFilteredInterests] = useState([]);

  const fetchInterests = async (query: string) => {
    if (!query.trim()) {
      setFilteredInterests([]);
      return;
    }
    try {
      const response = await fetch(
        `${endpoints.baseUrl}${endpoints.interest}?q=${query}&limit=100&from=0`,
        {
          method: 'GET',
          headers: {
            Authorization: `${endpoints.token}`,
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();
      const fetchedInterests = data.autocomplete || [];
      setAllInterests(fetchedInterests);
      filterInterests(query, fetchedInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  };

  const filterInterests = useCallback((query: string, interests = allInterests) => {
    const searchedWord = query.trim().toLowerCase();
    const exactMatches = interests.filter(
      item => item.name.toLowerCase().startsWith(searchedWord),
    );
    const otherMatches = interests.filter(
      item => 
        item.name.toLowerCase().includes(searchedWord) && 
        !item.name.toLowerCase().startsWith(searchedWord),
    );
    otherMatches.sort((a, b) => b.match - a.match);
    setFilteredInterests([...exactMatches, ...otherMatches]);
  }, [allInterests]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search.length >= 1) {
        const hasMatchingInterests = allInterests.some(interest => 
          interest.name.toLowerCase().startsWith(search.toLowerCase())
        );
        
        
        if (!hasMatchingInterests) {
          fetchInterests(search);
        } else {
          filterInterests(search);
        }
      } else {
        setFilteredInterests([]);
      }
    }, 200);

    return () => clearTimeout(delaySearch);
  }, [search]);

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: colors.background, paddingTop: 20}}>
        <View
          style={{height: '100%', paddingHorizontal: 16, paddingBottom: 15}}>
          {filteredInterests.length === 0 ? (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 20,
                  fontSize: 18,
                  color: 'gray',
                }}>
                Please search
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredInterests}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 16,
                  }}>
                  <Image
                    style={{height: 25, width: 25, borderRadius: 15}}
                    source={{
                      uri: item.avatar || 'https://picsum.photos/200/300',
                    }} // Default image if no avatar
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: colors.black,
                      fontSize: 16,
                      fontFamily: 'Montserrat-Bold',
                    }}>
                    {item.name}
                  </Text>
                </View>
              )}
              inverted
              keyExtractor={item => item.id.toString()}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      <View style={{backgroundColor: colors.background}}>
        <View
          style={{
            backgroundColor: colors.white,
            paddingHorizontal: 16,
            borderTopEndRadius: 16,
            borderTopLeftRadius: 16,
            paddingVertical: 16,
          }}>
          <TextInput
            style={{
              height: 50,
              backgroundColor: colors.background,
              color: 'black',
              paddingLeft: 10,
              borderRadius: 30,
            }}
            placeholder="Search interests..."
            placeholderTextColor={'black'}
            onChangeText={text => setSearch(text)}
            value={search}
          />
        </View>
      </View>
    </>
  );
}

export default App;