import admin from 'firebase-admin';
import env from './env';
import { initializeApp } from 'firebase/app';

export default admin.initializeApp({
	credential: admin.credential.cert({
		projectId: env.FB_PROJECT_ID,
		privateKey: env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
		clientEmail: env.FB_CLIENT_EMAIL,
	}),
	// databaseURL: `https://${env.FB_PROJECT_ID}.firebaseio.com`,
});

const firebaseConfig = {
	apiKey: env.FB_API_KEY,
	authDomain: env.FB_AUTH_DOMAIN,
	projectId: env.FB_PROJECT_ID,
	storageBucket: env.FB_STORAGE_BUCKET,
	messagingSenderId: env.FB_MEASUREMENT_ID,
	appId: env.FB_APP_ID,
	measurementId: env.FB_MEASUREMENT_ID,
};

const firebase = initializeApp(firebaseConfig);

export { firebase };
