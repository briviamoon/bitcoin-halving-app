import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

const App = () => {
	const [nextHalvingDate, setNextHalvingDate] = useState('');
	const [notification, setNotification] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchNextHalvingDate();
		registerForPushNotificationsAsync();
	}, []);

	const fetchNextHalvingDate = async () => {
		try {
			const response = await fetch('http://localhost:3000/next-halving');
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			const data = await response.json();
			setNextHalvingDate(data.nextHalvingDate);
		} catch (error) {
			console.error('Error fetching next halving date:', error);
			setError('Failed to fetch next halving date');
		}
	};

	const registerForPushNotificationsAsync = async () => {
		try {
			const { status: existingStatus } = await Permissions.getAsync(
				Permissions.NOTIFICATIONS
			);
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				throw new Error('Permission for notifications not granted');
			}

			const token = await Notifications.getExpoPushTokenAsync();
			console.log('Push token:', token);

			Notifications.addListener(handleNotification);
		} catch (error) {
			console.error('Error registering for push notifications:', error);
			setError('Failed to register for push notifications');
		}
	};

	const handleNotification = (notification) => {
		console.log('Received notification:', notification);
		setNotification(notification);
	};

	useEffect(() => {
		const notificationContent = {
			title: 'Bitcoin Halving Countdown',
			body: `Next Halving Date: ${nextHalvingDate}`,
		};
		setNotification(notificationContent);
		sendNotification(notificationContent);
	}, [nextHalvingDate]);

	const sendNotification = async (notification) => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: notification,
				trigger: null,
			});
			console.log('Notification sent:', notification);
		} catch (error) {
			console.error('Error sending notification:', error);
			setError('Failed to send notification');
		}
	};

	return (
		<View style={styles.container}>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<Text style={styles.notification}>
				{notification ? `${notification.title}: ${notification.body}` : 'Waiting for notification...'}
			</Text>
			<Text>Next Bitcoin Halving Date: {nextHalvingDate}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	notification: {
		fontWeight: 'bold',
		marginBottom: 20,
	},
	error: {
		color: 'red',
		marginBottom: 20,
	},
});

export default App;
