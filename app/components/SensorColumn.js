import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

// Reusable component for SensorColumn
const SensorColumn = ({ title, isEnabled }) => {
    const renderBoxes = () => {
        return [1, 2, 3].map((index) => (
        <View
            key={index}
            style={[styles.box, { backgroundColor: isEnabled ? getBackgroundColor() : 'white' }]}
        />
        ));
    };

    return (
        <View style={styles.ColumnContainer}>
            <Text>{title}</Text>
            {renderBoxes()}
        </View>
    );
};

const styles = StyleSheet.create({
    ColumnContainer: {
        flexDirection: "column",
        alignItems:'center',
        alignSelf: 'flex-start',
        
        paddingTop: 10,
        padding: 1,
    },
    box: {
        borderWidth:1,
        borderColor: 'grey',
        borderRadius:5,
        width:50,
        height:50
    },
});

export default SensorColumn;