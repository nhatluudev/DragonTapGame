import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

// Function to check if the given namiId exists in the referral list
async function checkNamiInCommunity(namiId) {
  // API URL
  // const referralCode = 'DRAGOTAP';
  const formatCurrency = 22;
  const limit = 10;
  const skip = 0;
  const refType = 'NAMI';

  // Get the current timestamp
  const timestamp = Date.now();
  const queryString = `code=${namiId}&format_currency=${formatCurrency}&limit=${limit}&skip=${skip}&refType=${refType}&timestamp=${timestamp}`;

  // Create the API signature (assuming you have the secret key)
  const apiSecret = process.env.SECRET_KEY; // Replace vith your secret key
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');

  // API URL
  const url = `https://nami.exchange/api/v3/users/referral/friends-v2?${queryString}&signature=${signature}`;

  // Define the headers, mimicking what you provided
  const headers = {
    'accept': 'application/json',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'cookie': 'AUTH=%7B%7D; _ga=GA1.1.1692520201.1726496541; client_id_nami_exchange=c3ecf2cbb8aed3f5a1f71d47ab72fb22oSOBkcad%2FGyVtZtoF7%2FRWJZobWo4uKEkgJh0A3IL57F%2BfuqzrPyZ6q8p3bV6GFs59AfoUJVEiEd3GtuuIHuhChc7KNz2W56l0uaROPW%2FZYpoHkASoKjnQiJGGNZq4s2C; NAMI_LOCALE=vi; _clck=d98cgq%7C2%7Cfpe%7C0%7C1720; _clsk=z3ikg0%7C1726983003873%7C10%7C1%7Cv.clarity.ms%2Fcollect; _ga_PK5ZL4W4G7=GS1.1.1726981381.4.1.1726983003.0.0.0; nami-game-session=c9c422e5d1641b910c768047b4cb9b2cfiDQo1gQdqu2uZ2jOJJMpxZXcpybnYlltlFeeTvntLINIOfEE%2FZIVHFsxSRWpK%2BlfXOwiFCs5Z0st%2B%2FcTC62qepiy0saMhfsNNRIYyu%2BDQ2m2fRWC60qijv96sqGQsH3; nami-game-session-values=62c92dfef44e4f67372d850e590f88bbm2o0yXrAY6IBNHEDKKNwhh59DdgpPRIpZbP2kGMtBT%2FovjeZ4xmwDLKSxWgR4bqdYZvWpr2Tss5M4A1DU7Xv68FtOxhxzU%2BcsIRIyCHFtp0WN47xiqKGkD53dXk1O2ELISvLx%2BxYDqFaRN0gwtDIJcQxyGz08Mv28co3WypkcFCbdw8dErNnOwEePp52u%2Fl5KrzBJ0LYawaSlCDKgJ%2ByOtpxAaigk%2FmiHj%2FnbSKZrnbJmRURP6cUFGayLqWzwOrmJ%2Ftr5Kp7qT0NbQtjNBz7Hg%3D%3D',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  };


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    if (response.ok) {
      const res = await response.json();
      const referrals = res.data.results;

      // Check if namiId is in the list of referrals
      const referral = referrals.find(ref => ref.code === namiId);

      if (referral) {
        return {
          isInCommunity: true,
          isKYC: referral.kyc_status === 2 // Check if KYC status is 2
        };
      } else {
        return {
          isInCommunity: false,
          isKYC: false
        };
      }
    } else {
      console.error(`Error: ${response.status}`, await response.json());
      return {
        isInCommunity: false,
        isKYC: false
      };
    }
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return {
      isInCommunity: false,
      isKYC: false
    };
  }
}

// Example usage:
const namiId = 'Nami489ASS2822'; // Replace this with the actual namiId you want to check
checkNamiInCommunity(namiId).then(result => {
  console.log(result);
});