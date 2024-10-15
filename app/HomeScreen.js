import React from "react";
import { StyleSheet, SafeAreaView,Alert, Text,Button, navigation, TouchableOpacity } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from "react-native";

export default function Hm({navigation}) {
    return(
        <SafeAreaView style={styles.container}>
            <View style={{ backgroundColor: "#000000d7", paddingTop: 40, paddingHorizontal: 20, height: 200, width: "100%",marginBottom: 50 }}>
            <LinearGradient
                // Background Linear Gradient
                colors={[ "#5c258d", "#4389a2"]}
                style={styles.background}
            />
            </View>
            

            <LinearGradient
                colors={['#5c258d', '#4389a2']}
                style={styles.gradientBorder}
                
                >
                <TouchableOpacity style={styles.button} 
                    onPress={ () => {navigation.navigate('Connect')}}     
                    activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => {
                alert('Under construction')}}
                style={{ backgroundColor: "#5c5de5", marginLeft: "auto", marginRight: "auto", marginTop: 10, borderRadius: 30, padding: 10, width: "70%", }}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, textAlign: "center" }}>Upload</Text>
            </TouchableOpacity>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
        connectButton:{
            width:"100%",
            height: 70,
            backgroundColor: "#fc5c65"
        
        },
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        },
        Btncontainer: {
            flex: 1,
            height: 50,
            width: 270,
            marginTop: 20,
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 100,
            borderColor: '#2cd18a',
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center'
            // backgroundColor: '#2cd18a'
        },
        background: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 300,
        },
        text: {
            fontSize: 18,
            color: '#2cd18a'
        },
        gradientBorder: {
            borderRadius: 30, // Rounded corners
            padding: 2, // Slight padding to show the gradient border
            width:"70%",
            margin:30
        },
        button: {
            backgroundColor: 'white', // White background
            borderRadius: 30, // Rounded corners
            paddingVertical: 10, // Padding for the button
            paddingHorizontal: 30, // Adjust horizontal padding as per your need
            alignItems: 'center',
            
        },
        buttonText: {
            color: '#5c5de5', // Text color to match the gradient
            fontSize: 16, // Text size
            fontWeight: 'bold',
        },

    
});