import app from "./app.js";
import settings from "./config/settings.js";

console.log(settings);

app.listen(settings.port, () => {
  console.log(`server running on ${settings.port}`);
});
console.log("fuck");
