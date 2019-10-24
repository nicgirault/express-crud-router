import fetch from "node-fetch";

global.Headers = fetch.Headers;
global.fetch = fetch;
