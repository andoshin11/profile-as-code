import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

const SOURCE = "https://github.com/andoshin11/social-profile/raw/master/profile.json"

enum Service {
	TWITTER = "twitter",
}

interface Profile {
	[Service.TWITTER]: string;
}

/**
 * getProfile function
 *
 * @return {Profile} Profile master data
**/
const getProfile = async (): Promise<Profile> => {
	const res = await fetch(SOURCE);
	const json = await res.json();
	return json;
}

export const testFunc = functions.https.onRequest(async (req, res) => {
  try {
    const profile = await getProfile();
    res.send(profile[Service.TWITTER]);
  } catch(e) {
    console.log(e)
  }
});