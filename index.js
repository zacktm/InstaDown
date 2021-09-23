let app = require("express")();
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

let server = require("http").createServer(app);

var port = process.env.PORT || 3001;

server.listen(port, function () {
  console.log("listening in http://localhost:" + port);
});

app.get("/", (req, res) => {
  res.json({ status: "online" });
});

// Packages
const Instagram = require("instagram-web-api");
const FileCookieStore = require("tough-cookie-filestore2");

const { username, password } = process.env; // Only required when no cookies are stored yet

const cookieStore = new FileCookieStore("./cookies.json");
const client = new Instagram({ username, password, cookieStore });

(async () => {
  // URL or path of photo
  const photo =
    "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg";

  await client.login();

  const media = await client.getMediaByShortcode({
    shortcode: "CS-NfT5DVw8",
  });
  console.log(media);
  //   console.log(media.edge_sidecar_to_children.edges);

  // Upload Photo to feed or story, just configure 'post' to 'feed' or 'story'
  //   const { media } = await client.uploadPhoto({
  //     photo: photo,
  //     caption: "testing",
  //     post: "feed",
  //   });
  //   console.log(`https://www.instagram.com/p/${media.code}/`);
})();

app.get("/down", (req, res) => {
  (async () => {
    console.log("processing..");

    const regex =
      /^https?:\/\/(?:www\.)?instagram\.com\/[^\/]+(?:\/[^\/]+)?\/([^\/]{11})\/.*$/gm;

    let m;
    var link = req.query.l;

    while ((m = regex.exec(req.query.l)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      link = m[1];
    }

    console.log("link ==> " + link);

    try {
      const media = await client.getMediaByShortcode({
        shortcode: link,
      });
      console.log(media.__typename);
      var url = "";
      if (media.__typename != "GraphSidecar") {
        res.json({
          status: "success",
          URL: parseDownloadLink(media),
        });
      } else {
        var urls = "";
        media.edge_sidecar_to_children.edges.forEach((element) => {
          urls = urls + parseDownloadLink(element.node) + ",";
        });

        urls = urls.substring(0, urls.length - 1);

        res.json({
          status: "success",
          URL: urls,
        });
      }
    } catch {
      res.json({
        status: "failed",
      });
    }
  })();
});

function parseDownloadLink(media) {
  if (media.__typename == "GraphImage") {
    return media.display_url;
  } else if (media.__typename == "GraphVideo") {
    return media.video_url;
  }
}