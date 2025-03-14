import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js";

let LungenklinikHemer = async (cluster, page, positions, levels) => {
  try {
   
    await page.goto("https://www.lungenklinik-hemer.de/leistungen-angebote/stellenangebote-ausbildung/#", {
      waitUntil: "load",
      timeout: 0,
    });


    //get all pagination links 
    await scroll(page);
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("p.multijobs-readmorelink > a")
      ).map((el) => el.href);
    });

    console.log(jobLinks);
    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async({page}) =>{
      let job = {
        title: "",
        location: "Theo-Funccius-Straße 1 58675 Hemer",
        hospital: "Lungenklinik Hemer",
        link: "",
        level: "",
        position: "",
        city: "Hemer",
        email: "",
        republic: "North Rhine-Westphalia",
      };

      await page.goto(jobLink, {
        waitUntil: "load",
        timeout: 0,
      });

      await page.waitForTimeout(1000);

      job.title = await page.evaluate(() => {
        let ttitle = document.querySelector("h2.multijobs-headline");
        return ttitle ? ttitle.innerText : "";
      });

  
      if (typeof job.location == "object" && job.location != null) {
        job.location = job.location[0];
      }
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
      job.email = await page.evaluate(() => {
        let mail = document.body.innerText.match(/[a-zA-Z0-9_+./-]+.@.[a-zA-Z0-9_+-./]+\.[a-zA-Z0-9_-]+/g);
        return mail || "N/A"
      });
      if (typeof job.email == "object" && job.email != null) {
        job.email = job.email[0];
      }

      job.link = jobLink;
      if(positions.map(el => el.toLowerCase()).include(job.position)) {
        await save(job);
      }
    });
    }
    
  } catch (err) {
    console.error(err);
  }
  
};


export default LungenklinikHemer;