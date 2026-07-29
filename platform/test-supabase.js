const { createBrowserClient } = require("@supabase/ssr");

try {
  createBrowserClient("not-a-url", "some-key");
  console.log("Success with bad url");
} catch (e) {
  console.log("Error with bad url:", e.message);
}

try {
  createBrowserClient("https://supabase.co", "some-key");
  console.log("Success with valid url format");
} catch (e) {
  console.log("Error with valid url:", e.message);
}
