import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js";
let johanneswerk = async (cluster,page,positions,levels) => {
  try {
    
    await page.goto("https://karriere.johanneswerk.de/stellenboerse.html", {
      waitUntil: "load",
      timeout: 0,
    });
    //scroll the page
    await scroll(page);

    await page.waitForTimeout(1000);
    //get all jobLinks
    let jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "#c1127 > div > table > tbody > tr > td.tdtitle > a"
        )
      ).map((el) => el.href);
    });
    console.log(jobLinks);

    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async ({ page }) => {
      let job = {
        title: "",
        location: "44789 Bochum",
        hospital: "Johanneswerk",
        city: "Bochum",
        link: "",
        level: "",
        email: "",
        position: "",
        republic: "North Rhine-Westphalia",
      };
      await page.goto(jobLink, {
        waitUntil: "load",
        timeout: 0,
      });

      await page.waitForTimeout(1000);
      //get title
      let title = await page.evaluate(() => {
        let ttitle = document.querySelector("h1");
        return ttitle ? ttitle.innerText : "";
      });
      job.title = title;

      let text = await page.evaluate(() => {
        return document.body.innerText;
      });
      //get email
      let email = await page.evaluate(() => {
        let eml = document.body.innerText.match(/[a-zA-Z-.]+@[a-zA-Z-.]+/)
          return eml ? eml[0] : ""
      });
      job.email =  email;
      //apply link
      let link = await page.evaluate(() => {
        let lnk = document.querySelector("#checkOutButton");
        return lnk ? lnk.href : "";
      });
      job.link = link;
      //get level
      let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/);
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
  
      if (positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())) {
        await save(job);
      }
    });
  }
  } catch (e) {
    print(e);
  }
};


export default johanneswerk;
