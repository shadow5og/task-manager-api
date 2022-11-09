const mailchimp = require("@mailchimp/mailchimp_transactional")(
  "TnYbygUOFFAqqARh5EhF7g"
);

async function callPing() {
  const response = await mailchimp.users.ping();
  console.log(response);
}

callPing();
