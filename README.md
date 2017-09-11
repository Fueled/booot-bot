# bOOOt bot
## Justworks ICS Reader
A bot that sends out a O.O.O. message for all registered P.T.O requests for currently JustWorks only. Basically schedules a Cloudwatch Event and executes a Lambda Function to chat on Slack. Gets the next week and calculates who is out in that week and nicely shows it:

Hey there :wave:, keeping you up to date on who's O.O.O. next week:

:house_with_garden: *Working Remotely* (2 in total):

- Rachel J.  is out on Thursday
- Nathan J.  from Wednesday and starts after the weekend

:palm_tree: *Vacation* (3 in total):

- Nathan J.  on Tuesday
- Rob S.  from Tuesday to Thursday
- Meredith  F.  from Thursday and starts after the weekend


## Installation

Install Serverless

```
npm install -g serverless
```

Clone our repository and run the install command inside the created directory:

```
npm install
```

To run local endpoints:
```
serverless offline start
```


## Deployment

To deploy new code to your AWS Account (configuration on serverless is required)

```
serverless deploy
```