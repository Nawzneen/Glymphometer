import React from "react";
import {useState} from 'react';
import { StyleSheet, SafeAreaView,ScrollView,Switch, Button, Text, View } from "react-native";
import SensorColumn from '../components/SensorColumn'; 
import { LinearGradient } from 'expo-linear-gradient';


// Function to get a random number from the array [10, 20, 30]
const getRandomNumber = () => {
    const numbers = [10, 20, 30];
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
};


const getBackgroundColor = () => {
    const numbers = [10, 20, 30];
    const randomIndex = Math.floor(Math.random() * numbers.length);
    let value = numbers[randomIndex];
    let color;
    if (value === 10) {
        color = 'tomato';
    } else if (value === 20) {
        color = 'gold';
    } else if (value === 30) {
        color = 'greenyellow';
    }
    return color;
};


export default function Connect() {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    return(
        <View showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
            <View style={{ backgroundColor: "#000000d7", paddingTop: 40, paddingHorizontal: 20, height: 200, width: "100%",marginBottom: 50 }}>
            <LinearGradient
                // Background Linear Gradient
                colors={[ "#5c258d", "#4389a2"]}
                style={styles.background}
            />
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 50}}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Home</Text>
                </View>
                <View style={styles.shadowCards}>
                    <View style={styles.Row}>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>Temperture</Text>
                            <Text style={styles.Details}>37°C</Text>
                        </View>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>HR(bpm)</Text>
                            <Text style={styles.Details}>60</Text>
                        </View>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>HRV(ms)</Text>
                            <Text style={styles.Details}>9°C</Text>
                        </View>
                    </View>
                    <View style={styles.Row}>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>Temp</Text>
                            <Text style={styles.Details}>7%</Text>
                        </View>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>Temp</Text>
                            <Text style={styles.Details}>5</Text>
                        </View>
                        <View style={styles.DetailsBox}>
                            <Text style={styles.Label}>HRV</Text>
                            <Text style={styles.Details}>30°C</Text>
                        </View>
                    </View>
                </View>
                
            </View>
                
            <View style={styles.container}>
                <View style={{  
                    paddingEnd:20 ,
                    paddingHorizontal:'center',
                    marginTop:40, 
                    alignSelf:"center",
                    width:'95%', 
                    backgroundColor:"#f7f0ba",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    borderRadius:10,
                    flexDirection:"row",
                    paddingTop:10,
                    paddingBottom:10,
                    marginBottom:10,
                    flex:1
                }}>
                    
                    <Text style={{ flex:1, textAlign: "center", fontWeight: "bold", fontSize: 14 }}>Signal Quality</Text>
                    <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        alignSelf='flex-end'
                        flex='1'
                    />
                </View>

                <View style={styles.SensorsContainer}> 
                    <SensorColumn title="NIRS 1" isEnabled={isEnabled}/>
                    <SensorColumn title="NIRS 2" isEnabled={isEnabled}/>
                    <SensorColumn title="NIRS 3" isEnabled={isEnabled}/>
                </View>
            </View>
        
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf:"center",
        marginTop: 20,
        width:"95%"
    },

    SecondaryInfoContainer: {
        backgroundColor: '#fff',
        borderRadius: 20, 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
        width: '95%',
        maxWidth: 478,
    },
    SensorsContainer:{
        borderRadius: 20, 
        flexDirection:"row",  
        justifyContent: 'center', 
        width: '95%', 
        height: 200,
        backgroundColor: 'aliceblue',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    Row : {
        flex:1,       
        flexDirection: 'row',
        width: '100%',
        color: 'black',
        padding: 10 ,
        alignItems: 'center',
        

    },
    DetailsBox:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',

    },

    Label:{
        fontSize: 18,
    },

    Details:{ 
        color: 'black',
        fontSize: 15,
        textTransform: 'capitalize',
    },
    box: {
        borderWidth:1,
        borderColor: 'grey',
        borderRadius:5,
        width:50,
        height:50
    },
    ColumnContainer: {
        flexDirection: "column",
        alignItems:'center',
        alignSelf: 'flex-start',
        
        paddingTop: 10,
        padding: 1,
    },
    shadowCards: {
        backgroundColor: "#ffffff",
        width: "95%",
        height: 150,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,

    },
    background: {
        left: 0,
        right: 0,
        top: 0,
        
    },
});


