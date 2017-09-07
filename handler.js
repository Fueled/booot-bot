'use strict';
import ical from 'ical'
import slackNotifier from 'slack-notify'
import moment from 'moment'

// Slack configuration
const slackWebhookURL = process.env.SLACK_WEBHOOK_URL;
let slack = slackNotifier(slackWebhookURL)

/**
 * @param  {Moment} from date
 * @param  {Moment} to date
 */
const getByDateRange = (fromDate, toDate) => {
  ical.fromURL(`${process.env.JUSTWORKS_ICS_URL}`, {}, function(err, calendarItems) {
    // Get all the vacation events
    let vacations = Object.keys(calendarItems).map(function (key) { return calendarItems[key]; })
      .filter(item => item.summary != undefined)
      //.filter(item => item.summary.indexOf('PTO') !== -1)

    let vacationsNextWeek = vacations.map(item => ({
      summary: (item.summary != undefined) ? item.summary : '',
      end: (item.end != undefined) ? moment(item.end) : moment(item.start),
      start: moment(item.start)
    }))
      .filter(item => item.start >= moment(fromDate))
      .filter(item => item.end <= moment(toDate))

    if (vacationsNextWeek.length > 0) {
      sendMessage(
        createEventMessage(
          sortCalendarItems(vacationsNextWeek)))
    }
  });
}


const sendMessage = (message) => {
  slack.send({
    channel: process.env.SLACK_CHANNEL_NAME,
    text: message
  });
}

/**
 * Filter out the summary title to only be the name of the user
 * @param  {String} - Summary to be edited  
 * @return {String} - Filtered value, showing only the name of the PTO request
 */
const createPTOText = (event) => {
  let dateFormat = "dddd MMMM Do"
  let dateSuffix =  `till ${moment(event.end).format(dateFormat)}`
  if (moment(event.end).day() >= 5 && moment(event.start).diff(event.end, 'days') < 7) {
    dateSuffix = `and starts again after the weekend.`
  }

  let dateMessage = ` from ${moment(event.start).format(dateFormat)} ${dateSuffix}`
  let strippedMessage = event.summary
    .replace('PTO', "")
    .replace(/ *\([^)]*\) */g, "")
    .replace(/^\s+|\s+$/g, '')

  return `- ${strippedMessage} ${dateMessage}`
}

const getEventEmoji = (eventType) => {
  return {
    "Vacation": ':palm_tree:',
    "Working Remotely": ':house_with_garden:'
  }[eventType] || ''
}

const createEventMessage = (eventGroups) => {
  let messaging = "Hey there :wave:, keeping you up to date on who's O.O.O. next week:"
  return messaging + Object.keys(eventGroups).reduce(function(accumulator, key) {
    if (eventGroups.hasOwnProperty(key)) {
      let message = `\n\n${getEventEmoji(key)} *${key}* (${eventGroups[key].length} in total):\n\n`
      message += eventGroups[key].map(event => createPTOText(event)).join('\n')

      return accumulator + message
    }

    return accumulator
  }, "");
  return messaging
}

const sortCalendarItems = (items) => {
  var typeRegex = /\((.*)\)/i;

  return items.reduce((accumulator, item) => {

    // Get 1 index rather then 0, as 0 is the full text with ()
    let type = typeRegex.exec(item.summary)

    if (type) {
      let eventKey = type[1]
      accumulator[eventKey] = (accumulator[eventKey] == undefined) ? [] : accumulator[eventKey];
      accumulator[eventKey].push(item)
    }

    return accumulator
  }, {})
}


module.exports.sendNextWeekEvents = (event, context, callback) => {

  let today = new moment()
  var fromDate = moment(today).day(8) // to get next Monday
  var toDate = moment(fromDate).day(7)

  console.log(`Sending slack message ${fromDate} to ${toDate}`)

  getByDateRange(fromDate, toDate)

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Sending',
      input: event,
    }),
  };

  callback(null, response);
};
