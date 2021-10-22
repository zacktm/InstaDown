const Instagram = require("instagram-web-api");
const FileCookieStore = require("tough-cookie-filestore2");
var fs = require("fs");

function startAccount(username, password, proxy) {
  var cookieStore = new FileCookieStore(
    "./accounts/" + username + "/cookies.json"
  );
  var client = new Instagram(
    { username, password, cookieStore },
    { proxy: proxy }
  );

  (async () => {
    const login = await client.login();
    console.log(login);

    const profile = await client.getProfile();
    console.log("Logged in as " + profile.username);

    const activity = await client.getActivity();
    // console.log(activity);

    engage(username, client, 0);

    fs.readFile(
      "./accounts/" + username + "/data.txt",
      "utf-8",
      (err, data) => {
        if (err) {
          console.log(err);
        }

        accountData = data.split(",");
        newStory(username, client, accountData[0], accountData[1]);
        newPost(username, client, accountData[0], parseInt(accountData[1]) + 2);
      }
    );

    // end of sync
  })();
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function engage(username, client, i) {
  var i = i;
  let rndInt = randomIntFromInterval(3, 22);
  let searchQuery = "sexy";
  if (rndInt < 12) {
    searchQuery = "nightout";
  }

  const media = await client.getPhotosByHashtag({ hashtag: searchQuery });
  // console.log(media.hashtag.edge_hashtag_to_media.edges[6].node.display_url);
  // console.log(media.hashtag.edge_hashtag_to_media.edges[6].node);

  await client
    .like({
      mediaId: media.hashtag.edge_hashtag_to_media.edges[rndInt].node.id,
    })
    .then(() => {
      console.log(
        username +
          "- LIKED: https://www.instagram.com/p/" +
          media.hashtag.edge_hashtag_to_media.edges[rndInt].node.shortcode
      );
      i = i + 1;
    });

  const followList = await client.getMediaLikes({
    shortcode: media.hashtag.edge_hashtag_to_media.edges[rndInt].node.shortcode,
    first: "49",
    after: "",
  });

  //   console.log("?media Likes:" + followList.count);
  if (followList.count > 1) {
    //follow first user
    await client.follow({ userId: followList.edges[1].node.id }).then(() => {
      console.log(
        username +
          "- FOLLOWED: https://instagram.com/" +
          followList.edges[1].node.username
      );
      i = i + 1;
    });
  }

  var freezeTime = randomIntFromInterval(30000, 600000);
  console.log(
    username +
      " - Engagements: " +
      i +
      " - Next Engage after " +
      freezeTime / 1000 +
      " seconds..."
  );

  setTimeout(() => {
    engage(username, client, i);
  }, freezeTime);
}

async function newStory(username, client, cloneUsername, id) {
  console.log(
    username + "- publish story from:" + cloneUsername + ", id= " + id
  );
  var cloneAccount = await client.getUserByUsername({
    username: cloneUsername,
  });

  // // Upload Photo to feed or story, just configure 'post' to 'feed' or 'story'
  photo = cloneAccount.edge_owner_to_timeline_media.edges[id].node.display_url;
  var upMedia = await client.uploadPhoto({
    photo: photo,
    caption:
      cloneAccount.edge_owner_to_timeline_media.edges[id].node
        .edge_media_to_caption.edges[0].node.text,
    post: "story",
  });
  console.log(
    username + "- NEWSTORY : https://www.instagram.com/p/" + upMedia.media.code
  );
  //update post number if file
  newId = parseInt(id) + 1;
  fs.writeFile(
    "./accounts/" + username + "/data.txt",
    cloneUsername + "," + newId,
    (err) => {
      if (err) console.log(err);
      console.log(username + "- Successfully Written to File.");
    }
  );

  var freezeTime = randomIntFromInterval(6000000, 50000000);
  console.log(
    username + "- Next Story after " + freezeTime / 600000 + " minutes..."
  );

  setTimeout(() => {
    try {
      newStory(username, client, cloneUsername, newId);
    } catch (err) {
      console.log(username + "- ERROR - PUBLISHING NEW STORY");
    }
  }, freezeTime);
}

async function newPost(username, client, cloneUsername, id) {
  console.log(
    username + "- publish post from:" + cloneUsername + ", id= " + id
  );
  var cloneAccount = await client.getUserByUsername({
    username: cloneUsername,
  });

  // // Upload Photo to feed or story, just configure 'post' to 'feed' or 'story'
  photo = cloneAccount.edge_owner_to_timeline_media.edges[id].node.display_url;
  var upMedia = await client.uploadPhoto({
    photo: photo,
    caption:
      cloneAccount.edge_owner_to_timeline_media.edges[id].node
        .edge_media_to_caption.edges[0].node.text,
    post: "feed",
  });
  console.log(
    username + "- NEWPOST : https://www.instagram.com/p/" + upMedia.media.code
  );

  var freezeTime = randomIntFromInterval(50000000, 100000000);
  console.log(
    username + "- Next Post after " + freezeTime / 600000 + " minutes..."
  );

  setTimeout(() => {
    try {
      newPost(username, client, cloneUsername, parseInt(id) + 2);
    } catch (err) {
      console.log(username + "- ERROR - PUBLISHING NEW POST");
    }
  }, freezeTime);
}

module.exports = startAccount;
