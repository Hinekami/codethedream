# codethedream
Advanced Pre-Work Assignment
For this assignment the Spotify API was used.\n Allows the user to see their information. \n Allows the user to search for content with filters.
## Installation
This implementation uses a mix of client and server side code so that most of the Js code runs on the client, with a few server endpoints that handle callbacks for Authentication purposes.
It requires Node.js to be installed since right now it's running locally. I'm currentyl taking an AWS course so if possible I want to create an EC2 instance that will host this in the future as a demo to showcase my work.
It requires some packages to be installed.
Express
Cookie-parser
Cors
Await
```bash
npm install cors
npm install cookie-parser
npm install express
npm install await
```
## Usage
If running outside of a Linux environment (like me), the following line needs to be included in the package.json file. Although it should already be in there.

"inotify":{"optional": true},

To run just open a terminal and navigate to the repository and execute the following command.

```bash
npm run dev
```
This is configured to run in localhost:8888, so just open a browser and navigate to it.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)