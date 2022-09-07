import scroll from "../../utils/scroll.js";
import print from "../../utils/print.js";
import save from "../../utils/save.js";

let bethal = async (cluster,page,positions,levels) => {
  try {
   
    await page.goto(
      "https://karriere.bethel.de/go/0000_Gesundheitsberufe/5101501/",
      {
        waitUntil: "load",
        timeout: 0,
      }
    );
    await scroll(page);

    //get all jobLinks
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("article.tabular-list__item > a")
      ).map((el) => el.href);
    });
    console.log(jobLinks);
    let allJobs = [];
    for (let jobLink of jobLinks) {
      cluster.queue(async ({ page }) => {
        let job = {
          title: "",
          location: "",
          city: "Warburg",
          hospital: "Helios Klinikum Warburg",
          link: "",
          email: "",
          level: "",
          position: "",
          republic: "North Rhine-Westphalia",
        };
        await page.goto(jobLink, {
          waitUntil: "load",
          timeout: 0,
        });
        await page.waitForTimeout(1000);
        // title
        let title = await page.evaluate(() => {
          let ttitle = document.querySelector("h2.billboard-panel__title");
          return ttitle ? ttitle.innerText : "";
        });
        job.title = title;
        let text = await page.evaluate(() => {
          return document.body.innerText;
        });
        //get level
        let level = text.match(/Facharzt|Chefarzt|Assistenzarzt|Arzt|Oberarzt/);
        let position = text.match(/arzt|pflege/);
        job.level = level ? level[0] : "";
        if (
          level == "Facharzt" ||
          level == "Chefarzt" ||
          level == "Assistenzarzt" ||
          level == "Arzt" ||
          level == "Oberarzt"
        ) {
          job.position = "artz";
        }
        if (position == "pflege" || (position == "Pflege" && !level in levels)) {
          job.position = "pflege";
          job.level = "Nicht angegeben";
        }
        //get link
        await page.waitForSelector;
        let link = await page.evaluate(() => {
          let getLink = document.querySelector(".button-form");
          // getLink.click();
          let applyLink = document.querySelector("a.button");
          return applyLink ? applyLink.href : null;
        });
        job.link = link;
        //get email
        let email = await page.evaluate(() => {
          let eml = document.querySelector(
            "#c101700 > div > section.content-block-list > div > article:nth-child(5) > div > div"
          );
          return eml
            ? eml.innerText.match(/[a-z.]+[a-z]+.\[at].[a-z-]+[a-z.]+[a-z.]+/g)
            : "";
        });
        job.email = String() + email;
        //get location
        let location = await page.evaluate(() => {
          let loc = document.getElementsByTagName("td")[1];
          return loc ? loc.innerText : null;
        });
        job.location = location;

         if(positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())){
          await save(job);
        }
      });
    }
  } catch (e) {
    print(e);
  }
};

export default bethal;