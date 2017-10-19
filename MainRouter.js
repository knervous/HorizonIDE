import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Launch from './components/Launch';
import Editor from './components/Editor';
import ProjectSelect from './components/ProjectSelect'
import CreateNewProject from './components/CreateNewProject'
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
import {
  Scene,
  Router,
  Actions,
  Reducer,
  ActionConst,
  Overlay,
  Tabs,
  Modal,
  Drawer,
  Stack,
  Lightbox,
} from 'react-native-router-flux';

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: 'transparent', justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarStyle: {
    backgroundColor: '#eee',
  },
  tabBarSelectedItemStyle: {
    backgroundColor: '#ddd',
  },
});

const reducerCreate = params => {
  const defaultReducer = new Reducer(params);
  return (state, action) => {
    console.log('ACTION:', action);
    return defaultReducer(state, action);
  };
};

const getSceneStyle = () => ({
  backgroundColor: '#F5FCFF',
  shadowOpacity: 1,
  shadowRadius: 3,
});

const MainRouter = () => (
  <Router
    createReducer={reducerCreate}
    getSceneStyle={getSceneStyle}
  >
    <Overlay>
      <Modal
        hideNavBar
        transitionConfig={() => ({ screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid })}
      >
        <Lightbox>
          <Stack
            hideNavBar
            key="root"
            titleStyle={{ alignSelf: 'center' }}
          >
            {/* <Scene key="echo" back clone component={EchoView} getTitle={({ navigation }) => navigation.state.key} /> */}
            <Scene key="launch" component={Launch} title="Launch" initial />
            <Scene key="editor" component={Editor} title="Editor"  />
            <Scene key="projectSelect" component={ProjectSelect} title="Editor"  />
            <Scene key="createNewProject" component={CreateNewProject} title="Editor"  />
          </Stack>
        </Lightbox>
      </Modal>
    </Overlay>
  </Router>
);

export default MainRouter;
