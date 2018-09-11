/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Client } from 'twilio-chat';
import Login from './js/components/Login';
import EventsLog from './js/components/EventsLog';
import Log from './js/logging';
import FirebaseSupport from './js/FirebaseSupportModule';
import ChatClientHelper from './js/chat-client-helper';

ngrokSubdomainName = require('./configuration.json').ngrokSubdomain;
const host = 'http://' + ngrokSubdomainName + '.ngrok.io';

export default class TwilioChatJsReactNative extends Component {
  client;
  channel;

  state = {
    client: null,
    log: [],
    loading: false
  };

  login(username, host) {
    this.setState({ loading: true }, () => {
      let log = new Log(this.addNewLog.bind(this));
      let chatClientHelper = new ChatClientHelper(host, log);
      chatClientHelper
        .login(
          username,
          'fcm',
          FirebaseSupport.registerForPushCallback,
          FirebaseSupport.showPushCallback
        )
        .then(() => {
          this.setState({ client: chatClientHelper, loading: false });
        });
    });
  }

  addNewLog(string) {
    let log = this.state.log;
    log.push(string + '\n');
    this.setState({ log });
  }

  joinChannel() {
    this.state.client.client
      .getChannelByUniqueName('general')
      .then(channel => {
        channel
          .join()
          .then(chatChannel => {
            this.channel = chatChannel;
            Alert.alert('Notification', 'Join Channel successfully!');
          })
          .catch(err => {
            const parseError = this.parseError(err);
            if (parseError.code) {
              if (parseError.code === 50404) {
                this.channel.leave();
                return Alert.alert('Notification', parseError.message);
              }
              Alert.alert('Notification', parseError.message);
            }
          });
      })
      .catch(error => {
        const parseError = this.parseError(error);
        if (parseError.code) {
          Alert.alert('Notification', parseError.message);
        }
      });
  }

  createChannel() {
    if (this.state.client) {
      this.state.client.client
        .createChannel({
          uniqueName: 'general',
          friendlyName: 'General Chat Channel',
          isPrivate: true
        })
        .then(channel => {
          this.channel = channel;
        })
        .catch(error => {
          const parseError = this.parseError(error);
          if (parseError.code) {
            Alert.alert('Notification', parseError.message);
          }
        });
    }
  }

  startChat() {
    if (this.channel) {
      this.channel
        .sendMessage(
          `Random Number ${Math.floor(Math.random() * Math.floor(50))}`
        )
        .then(message => {
          console.log('message Index', message);
        })
        .catch(error => {
          const parseError = this.parseError(error);
          if (parseError.code) {
            Alert.alert('Notification', parseError.message);
          }
        });
    }
  }

  parseError(error) {
    return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }

  render() {
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <Login host={host} login={this.login.bind(this)} />
        {this.state.client ? <EventsLog eventslog={this.state.log} /> : null}
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderRadius: 5,
            padding: 20,
            alignItems: 'center',
            marginBottom: 20
          }}
          onPress={() => this.createChannel()}
        >
          <Text>Create Channel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderRadius: 5,
            padding: 20,
            alignItems: 'center',
            marginBottom: 20
          }}
          onPress={() => this.joinChannel()}
        >
          <Text>Join Channel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderRadius: 5,
            padding: 20,
            alignItems: 'center'
          }}
          onPress={() => this.startChat()}
        >
          <Text>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

AppRegistry.registerComponent(
  'TwilioChatJsReactNative',
  () => TwilioChatJsReactNative
);

// if you want to send the raw push to the JS library to reparse
// (while app is not running), you can use this react native pattern to call static JS method
// AppRegistry.registerHeadlessTask('FCMParsePush', () => require('./js/FCMParsePush'));
