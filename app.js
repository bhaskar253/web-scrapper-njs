const express = require('express')
const rp = require('request-promise')
const {getAllUrls} = require('./getAllUrls')
const {mongoose} = require('./db/mongoose')
const {ChannelDetail} = require('./models/channeldetail')

const mainURL = 'https://www.socialbakers.com/statistics/youtube/channels/india/'

const PORT = 3000
const app = express()

app.get('/',(req,res) => {
    getAllUrls().then((data)=>{
        console.log(data.size)
        data.forEach((channel) => {
            let channeldetail = new ChannelDetail(JSON.parse(channel))
            channeldetail.save().then((data)=>{
                console.log(JSON.parse(data))
            }).catch((err)=>{
                console.log(err)
            })
        });
        return Promise.resolve()
    })
    .then(ChannelDetail.find({}))
    .then((channeldetails) => {
        res.status(200).send({channeldetails})
    })
    .catch((err) => {
        console.log(err)
        res.status(500).send('Something Went wrong!!')
    })
})

app.listen(PORT,()=>{
    console.log(`App is running at ${PORT}`)
})