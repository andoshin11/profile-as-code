import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import * as Google from 'googleapis-async';
import TwitterClient from './twitter';

const SOURCE = "https://github.com/andoshin11/social-profile/raw/master/profile.json";

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

/**
 * getAccessToken function
 *
 * @param {Object} req Cloud Function request context
**/
const getAccessToken = (req) => {
  const header = req.get('Authorization')
  if (header) {
      const match = header.match(/^Bearer\s+([^\s]+)$/);
      if (match) {
          return match[1];
      }
  }
  return null;
}

/**
 * isValidUser function
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 * @return {boolean} whether the user is valid
 */
const isValidUser = async (req, res): Promise<boolean> => {
  const accessToken = getAccessToken(req);

  if (!accessToken) return false;

  const auth = new Google.auth.OAuth2();

  // Set credential
  auth.setCredentials({ access_token: accessToken });

  const bucket = functions.config().bucket.pac;
  const permission = 'storage.buckets.get';
  const options = {
    bucket,
    permissions: [permission],
    auth
  }

  try {
    const response = await Google.storage('v1').buckets.testIamPermissions(options)
    if (response && response['permissions'] && response['permissions'].includes(permission)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw new Error(e)
  }
}

export const updateProfile = functions.https.onRequest(async (req, res) => {
  try {
    const isValid = await isValidUser(req, res)
    if (isValid) {
      const profile = await getProfile();
      const client = new TwitterClient();

      await client.updateProfile(profile[Service.TWITTER]);
      res.send('success');
    } else {
      res.status(403).send("The req is forbidden.");
    }
  } catch(e) {
    console.log(e)
  }
});
