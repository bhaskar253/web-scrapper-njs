const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const {mongoose} = require('./db/mongoose')
const {ChannelDetail} = require('./models/channeldetail')


let listOfChannelDetails = []

// Parses all digits in a given string
function parseDigits(str) {
    return str.replace(/\D/g,'')
}

let myRequest = (error,response,html) => {
    if(!error && response.statusCode == 200) {
        // Loads the web page for scraping 
        const $ = cheerio.load(html);
        
        // Find the required table
        let tableBody = $('.brand-table-list > tbody:nth-child(1)')
        
        // Template for finding title, subscribers and total views from table row
        let title = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(2) > div:nth-child(1) > a:nth-child(1) > h2:nth-child(3)`,
        subscribers = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(3) > div:nth-child(1)`,
        totalViews = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(4) > div:nth-child(1)`
        
        // Loop through all indexes of table and display the child
        listOfChannelDetails = []
        tableBody.children().each((idx,elem) => {
            let t = $(title.replace("%s",(idx+1))).text(),
            s = parseDigits($(subscribers.replace("%s",(idx+1))).text()),
            tv = parseDigits($(totalViews.replace("%s",(idx+1))).text())
            if(t!==''){
                listOfChannelDetails.push({title: t,subscribers: s, totalViews: tv})
            }
        });
        listOfChannelDetails.forEach((channel)=>{
            let channeldetail = new ChannelDetail(channel)
            channeldetail.save().then((data)=>{
                console.log(data)
            }).catch((err)=>{
            })
        })
    }
}

const app = express();
const port = 3000

app.get("/",(req,res) => {
    const url = 'https://www.socialbakers.com/statistics/youtube/channels/india/'
    request(url, myRequest)
    res.send(JSON.stringify(listOfChannelDetails))
})

app.listen(port, () => {
    console.log(`App is running on port ${port}!`)
})
