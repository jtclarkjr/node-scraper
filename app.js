const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const mkdirp = require('mkdirp');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//  'https://w13.mangafreak.net/Read1_One_Piece_1';

start = (URL) => {
  request(URL, (error, response, html) => {
    if (!error) {
      const $ = cheerio.load(html);
      const noOfPages = $('#select > option:nth-last-child(1)').text();
      console.log('Number of pages: ' + noOfPages);

      // TODO: clean up selectors
      const chapterSelector = $('body > div.god_box > div.main > div > div > div.top_section > div > div:nth-child(1) > strong').text();
      const title = $('body > div.god_box > div.main > div > div > div.top_section > article > h1 > a').text();
      const path = './' + $('body > div.god_box > div.main > div > div > div.top_section > article > h1 > a').text();
      const name = title.split(' ').join('_').toLowerCase();
      const chapter = chapterSelector.split(' ').pop();
      if (!fs.existsSync(path)) {
        mkdirp(path, (err) => {
          if (err) console.error(err);
          else console.log('Manga will be save at: ' + path);
        });
      }

      let i;
      for (i = 1; i <= noOfPages; i++) {
        const nowPath = path + '/' + i + '.jpg';
        const nowURL = URL + '/' + i;
        saveImage(nowURL, nowPath, name, chapter, i);
      }
    }
  });
}

saveImage = (URL, path, name, chapter, page) => {
  request(URL, (error, response, html) => {
    if (!error) {
      const imgURL = `https://images.mangafreak.net/mangas/${name}/${name}_${chapter}/${name}_${chapter}_${page}.jpg`
      request.get(
        {
          url: imgURL,
          encoding: 'binary'
        },
        (err, response, body) => {
          fs.writeFile(path, body, 'binary', (err) => {
            if (err) console.log(err);
            else console.log(path + ' saved!');
          });
        }
      );
    } else {
      console.log(error);
    }
  });
}

rl.question('Enter the manga chapter (mangafreak url): ', answer => {
  console.log(`URL entered: ${answer}`);
  rl.close();
  start(answer);
});