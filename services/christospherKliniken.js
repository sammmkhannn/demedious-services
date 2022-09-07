import scroll from "../utils/scroll.js";
import print from "../utils/print.js";
import save from "../utils/save.js";

let gfo_kliniken = async (cluster,page,positions,levels) => {
  try {

    await page.goto("https://christophorus-kliniken.de/stellenangebote/stellenangebote-aerztlicher-dienst/", {
      waitUntil: "load",
      timeout: 0,
    });

    await scroll(page);

    //get all jobLinks
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".job-items > a")
      ).map((el) => el.href);
    });

    console.log(jobLinks);
    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async ({ page }) => {
      
        let job = {
          title: "",
          location: "",
          hospital: "Klinik am Schlossgarten Dülmen",
          link: "",
          level: "",
          position: "",
          city: "Dülmen",
          email: "",
          republic: "North Rhine-Westphalia",
        };

        await page.goto(jobLink, {
          waitUntil: "load",
          timeout: 0,
        });

        await page.waitForTimeout(1000);
        //   let tit = 0;
        //   if(tit){
        let title = await page.evaluate(() => {
          let ttitle = document.querySelector("h1.jobOfferDescription");
          return ttitle ? ttitle.innerText : "";
        });
        job.title = title;
    

        job.location = await page.evaluate(() => {
          return document.body.innerText.match(/[a-zA-Z-.ü].+ \d+[\n]\d+ [a-zA-Z-.ü]+|[a-zA-Z-.ü].+ \d+[\n][\n]\d+ [a-zA-Z-.ü]+/) || "Vollenstrasse 10 48249 Dülmen";
        });

        if (typeof job.location == 'object' && job.location != null) {
          job.location = job.location[0]
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
        job.email = await page.evaluate(() => {
          return document.body.innerText.match(/[a-zA-Z-.ü]+@[a-zA-Z-.ü]+|[a-zA-Z-.]+[(]\w+[)][a-zA-Z-.]+/) || ""
        });
        if (typeof job.email == "object" && job.email != null) {
          job.email = job.email[0]
        }
        // job.email = email

        // get link 
        let link1 = 0;
        if (link1) {
          const link = await page.evaluate(() => {
            let applyLink = document.querySelector('a.apply-job-link')
            return applyLink ? applyLink.href : ""
          })
          job.link = link;
        } else {
          job.link = jobLink
        }

        if(positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())){
          await save(job);
        }

      });
    }
   
  } catch (e) {
    print(e);
  }
};


export default gfo_kliniken
