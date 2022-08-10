import AWS from 'aws-sdk';
import axios from 'axios';
import { config } from '../config';

export const getSignedUrl = (filekey: string, expiryTime: number = 1825 * 24 * 60 * 60 * 1000) => {
  const signer = new AWS.CloudFront.Signer(config.awsCloudFrontAccessKeyId, config.awsCloudFrontPrivateKey);
  return signer.getSignedUrl({
    url: `${config.awsCloudFrontDomain}/${filekey}`,
    expires: Math.floor((Date.now() + expiryTime) / 1000)
  });

}

export const _getCloudflareSignedUrl = async (filekey: string, expiryTime: number = 1825 * 24 * 60 * 60 * 1000) => {
  const response = await axios(
    `${config.cfStreamUrl}/accounts/${config.cfAccountId}/stream/${filekey}/token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.cfAccessToken}`
      }
    }
  )
  console.log(response.data.result.token)
  return `https://cloudflarestream.com/${response.data?.result?.token}/manifest/video.m3u8`
}