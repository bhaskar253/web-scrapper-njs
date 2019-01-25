const rp = require('request-promise')
const $ = require('cheerio')
const {mongoose} = require('./db/mongoose')
const {ChannelDetail} = require('./models/channeldetail')

const mainURL = 'https://www.socialbakers.com/statistics/youtube/channels/india/'
let URL = ''
const urls = ['']

// For caching the non-duplicate data recieved in each call
const listOfChannelDetails = new Set()

// Utility function for parsing digits from a string 
function parseDigits(str) {
    return str.replace(/\D/g,'')
}

// For extracting data from requested html page and cache it
let doScraping = function (html){
    // Find the required table
    let tableBody = $('.brand-table-list > tbody:nth-child(1)',html)
        
    // Template for finding title, subscribers and total views from table row
    let title = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(2) > div:nth-child(1) > a:nth-child(1) > h2:nth-child(3)`,
    subscribers = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(3) > div:nth-child(1)`,
    totalViews = `.brand-table-list > tbody:nth-child(1) > tr:nth-child(%s) > td:nth-child(4) > div:nth-child(1)`
    
    // Loop through all indexes of table and display the child
    tableBody.children().each((idx,elem) => {
        let t = $(title.replace("%s",(idx+1)),html).text(),
        s = parseDigits($(subscribers.replace("%s",(idx+1)),html).text()),
        tv = parseDigits($(totalViews.replace("%s",(idx+1)),html).text())
        if(t!==''){
            const newDoc = JSON.stringify({title: t,subscribers: s, totalViews: tv})
            if(!listOfChannelDetails.has(newDoc)){
                listOfChannelDetails.add(newDoc)
                console.log(newDoc + listOfChannelDetails.size)
            }
        }
    });
}

// Loads all pages until there is no more to load 
let myFun = function (html) {
    if(URL==='page-96-100/') {
        doScraping(html)
        return Promise.resolve(listOfChannelDetails)
    }
    let showMoreButtonHref = $('.more-center-link',html).children()[0].attribs.href
    let s = showMoreButtonHref.split('/')
    URL = s[s.length-2]+'/'

    // Do Some Work
    //urls.push(URL)
    doScraping(html)

    // Recursively make requests
    return rp(mainURL+URL).then(myFun).catch(function (err){console.log(err)})
}

let getAllUrls = function (){
    return rp(mainURL+URL).then(myFun).catch(function (err){console.log(err)})
}
// getAllUrls().then((data)=>{
//     console.log(listOfChannelDetails.size)
//     listOfChannelDetails.forEach((channel) => {
//         let channeldetail = new ChannelDetail(JSON.parse(channel))
//         channeldetail.save().then((chan)=>{
//         }).catch((err)=>{
//         })
//     });
// }).catch((err) => {
//     console.log(err)
// })
module.exports = {getAllUrls};