import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:3000/api'; //back end test
`$BASE_URL`

let tokenValue = "";

test.describe('Front-end test', ()=> {
  test.beforeAll( 'test 01', async () => {
    // Request1 - get a access token.
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'username': 'tester01',
        'password': 'GteteqbQQgSr88SwNExUQv2ydb7xuf8c'
      }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    console.log(data);
    const accessToken = data.token;
    console.log(accessToken)
  
    //Request2 - Create a new client.
    const createClientResponse = await fetch('http://localhost:3000/api/client/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-auth': JSON.stringify({
          'username': "tester01",
          'token': accessToken
        })
      },
      body: JSON.stringify({
        "name": "Nicole",
        "email": "nicole@email.com",
        "telephone": "13343"
      })
    });
  
    expect(createClientResponse.status).toBe(200);
  });
  
  test('test 02', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    expect(page.url()).toBe('http://localhost:3000/login');
    await expect(page.getByRole('link', { name: 'Tester Hotel' })).toBeVisible();
    await page.locator('input[type="text"]').fill('tester01');
    await page.locator('input[type="password"]').fill('GteteqbQQgSr88SwNExUQv2ydb7xuf8c');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Tester Hotel Overview' })).toBeVisible();
    await page.waitForTimeout(2000);
  });

  });




test.describe('Backend test', ()=> {
  
  test.beforeAll('Get token for API', async ({ request }) => {

    const responseLoging = await request.post(`${BASE_URL}/login`, {
      data: {
        username: "tester01",
        password: "GteteqbQQgSr88SwNExUQv2ydb7xuf8c"
      }
    });
    const responseBody = await responseLoging.json();
    tokenValue = responseBody.token;
    console.log(tokenValue)
  });
 
  // 1. Get Token (GET)
  test('Test case 01 - Test token has value', async ({ request }) => {

  expect(tokenValue).toBeTruthy();

  });

  test('Test case 02 - Get all rooms', async ({ request }) => {
    console.log(tokenValue)
    const getPostsResponse = await request.get('http://localhost:3000/api/rooms', {
      headers: {
        'X-user-auth': JSON.stringify({
          username: 'tester01',
          token: tokenValue
        }),
        'Content-Type': 'application/json'
      },

    });

    expect(getPostsResponse.status()).toBe(200);

    const rooms = await getPostsResponse.json() 
  });

  test('Test case 03 - Create room with POST', async ({ request }) => {
    console.log(tokenValue)
    var getPostsResponse = await request.post('http://localhost:3000/api/room/new', {
      headers: {
        'X-user-auth': JSON.stringify({
          username: 'tester01',
          token: tokenValue
        }),
        'Content-Type': 'application/json'
      },
      data: {
        features: ['balcony'],
        category: 'single',
        number: '4',
        floor: '5',
        available: true,
        price: 2000
      }
    });
    expect(getPostsResponse.status()).toBe(200); //it shouldn be 201 for created??
    const room = await getPostsResponse.json();
    expect(room).toHaveProperty('floor'); //add tests for other props with values
  });
});
