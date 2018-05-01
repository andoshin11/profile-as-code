import * as functions from 'firebase-functions'
import * as Twitter from 'twitter'

export default class TwitterClient {
  private client

  constructor() {
    this.client = new Twitter({
      consumer_key: functions.config().twitter.consumer_key,
      consumer_secret: functions.config().twitter.consumer_secret,
      access_token_key: functions.config().twitter.access_token_key,
      access_token_secret: functions.config().twitter.access_token_secret
    })
  }

  /**
   * updateProfile function
   * updates twitter profile
  **/
  updateProfile(description: string): Promise<void> {
	  return this.client.post('account/update_profile', {
		  description
	  })
  }
}
