//To read the settings.properties file
var PropertiesReader = require('properties-reader');

//To interact with Discord
const Discord = require('discord.js');

//To be able to write to files
var fs = require("fs");

//To do math evaluations
var math = require("mathjs");

//Initialising properties file
var properties = PropertiesReader('settings.properties');

//Initalising the bot
const client = new Discord.Client();

//Setting up bot token
const token = properties.get('token');

//Initalising ownerID
var ownerID = properties.getRaw('ownerID');

//Initalising the command prefix
var prefix = properties.getRaw('prefix');

//The regex we will use to check if the name is valid
var inputFilter = /^[A-Za-z0-9]+$/;

//The regex we will use to replace user mentions in message
var mentionFilter = /\s(<?@\S+)/g;

//Counter Prototypes
var dummy = {
    owner: '0',
    value: 0,
    step: 1,
    name: 'dummy',
    textView: 'Value of %name%: %value%',
    textPlus: ':white_check_mark: The pomodoro count has been incremented. New value: %value%. :arrow_up:',
    textMinus: ':white_check_mark: The pomodoro count has been decremented. New value: %value%. :arrow_down:',
    textReset: 'The value of %name% has been reset to %value%.',
    textValue: 'The value of %name% has been set to %value%.',
    textLeaderboard: 'Pomodoro Challenge Leaderboard :',
    leaderboard: {},
    whitelist: {}
};

var userLeaderboardDummy = {
    id: '0',
    username: 'dummy',
    value: 0
};

//Initialising the counter file
var counters = require('./counters.json');

//Initialising HTTP Requests
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

client.on('ready', () => {
  //Start-up Message
  console.log(' -- READY TO RUMBLE -- ');
  client.user.setActivity("myself", { type: "PLAYING"});
});

client.on("message", (message) => {

  //Deleting PokéCord Messages from channels
  if(message.author.id == '365975655608745985' && message.channel.id !== '565767793627103242'){
    message.delete(4000);
  }

  //Ignoring messages from other bots
  if(message.author.bot){
    return;
  }

  //#General Greeting Reactions
  if(message.channel.name === 'general'){
    var messageText = message.content.toLowerCase();
    if(messageText.includes('morning') && !messageText.includes('?') && !messageText.includes('hope') && (messageText.includes(' all') || messageText.includes(`y'all`) || messageText.includes('everyone') || messageText.includes('everybody') || messageText.includes('guys') || messageText.includes('dreamers') || messageText.includes('friends')) && messageText.length < 75){
      message.react('🌞');
      return;
    }

    if((messageText.includes('goodnight') || messageText.includes('good night')) && !messageText.includes('?') && !messageText.includes('hope') && (messageText.includes(' all') || messageText.includes(`y'all`) || messageText.includes('everyone') || messageText.includes('everybody') || messageText.includes('guys') || messageText.includes('dreamers') || messageText.includes('friends')) && messageText.length < 75){
      message.react('🌙');
      return;
    }
  }

  if(!message.content.startsWith(prefix)){
    return;
  }

  //Remove prefix and then separate out arguments based on spaces
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  //!raid, to give access to a shared pom timer
  if (cmd === 'raid'){
    message.channel.send(`To join a raid with ${message.member.displayName} and the Dream Team, click here: https://cuckoo.team/thedreamtm`);
    message.delete(200);
  }

  //!choose, to give you a choice between specified options
  if (cmd === 'choose' || cmd === 'pick'){
    var data = message.content.substring(prefix.length + cmd.length + 1);
    var option = data.trim().split(',');
    if(!option[0]){
      message.channel.send(":x: **Error:** To use this command, type `!choose <option 1>, <option 2>, etc` **e.g.** `!choose eat, sleep, work, party`.");
      return;
    }

    for(var num = 0; num < option.length; num++){
      option[num] = option[num].trim();
    }

    var select = Math.floor(Math.random()*option.length);
    message.channel.send(`By decree of <@566494718549164043>,\n\n**${option[select]}.**`);
  }

  //!search, the google search command
  if (cmd === 'google' || cmd === 'g' || cmd === 'search' || cmd === 's'){
    if(!args[0]){
      message.channel.send("Type `!search <search terms>` to google something!");
      return;
    }

    var link = 'https://www.google.com/search?q=';
    var searchTerms = message.content.trim().substring(prefix.length + cmd.length + 1);
    for(var num = 0; num < args.length; num++){
      if(num === 0){
        link = link + args[num];
      } else {
        link = link + '%20' + args[num];
      }
    }

    message.channel.send(`To Google-Search **${searchTerms}** click this link: ${link}.`);
  }

  //!define, the definition command
  if (cmd === 'define' || cmd === 'd'){
    if(!args[0]){
      message.channel.send("Type `!define <word>` to find the definition of something!");
      return;
    } else if (args[1]){
      message.channel.send(":x: **Error:** Please only try to define one word at once.");
      return;
    }
    var link = 'https://www.google.com/search?q=define%20' + args[0];
    message.channel.send(`To get the definition of **${args[0]}** click this link: ${link}.`);
  }

  //!youtube, the youtube search command
  if (cmd === 'youtube' || cmd === 'yt'){
    if(!args[0]){
      message.channel.send("Type `!youtube <search terms>` to search YouTube for something!");
      return;
    }

    var link = 'https://www.youtube.com/results?search_query=';
    var searchTerms = message.content.trim().substring(prefix.length + cmd.length + 1);
    for(var num = 0; num < args.length; num++){
      if(num === 0){
        link = link + args[num];
      } else {
        link = link + '+' + args[num];
      }
    }

    message.channel.send(`To YouTube-Search **${searchTerms}** click this link: <${link}>`);
  }

  //!translate, the Google-Translate command
  if (cmd === 'translate' || cmd === 't'){
    if(!args[0]){
      message.channel.send("Type `!translate <text>` to use Google Translate to translate text into English!");
      return;
    }

    var link = 'https://translate.google.com.au/#view=home&op=translate&sl=auto&tl=en&text=';
    var text = message.content.trim().substring(prefix.length + cmd.length + 1);
    for(var num = 0; num < args.length; num++){
      if(num === 0){
        link = link + args[num];
      } else {
        link = link + '%20' + args[num];
      }
    }

    message.channel.send(`To Google Translate **${text}** click this link: <${link}>`);
  }

  ////////////////////////////////////////////////
  //           POM LEADERBOARD COMMANDS         //
  ////////////////////////////////////////////////
  if (cmd === 'addcounter' || cmd === 'ac') {
      if (args.length == 1) {
        if(!isStaff(message.member)){
          message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
          return;
        }
          var state = addCounter(message.author.id, args[0]);
          if (state == 1) {
              message.channel.send(':white_check_mark: The counter has been correctly added.');
          } else if (state == 2) {
              message.channel.send(':x: **Error:** A counter with this name already exists, please choose another one.');
          } else if (state == 3) {
              message.channel.send(':x: **Error:** Your counter name contains illegal characters. Please match /^[A-Za-z0-9]+$/.');
          }
      }
  } else if (cmd === 'delcounter' || cmd === 'dc') {
      if(!isStaff(message.member)){
        message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
        return;
      }
      if (args.length == 1) {
          var state = delCounter(message.author.id, args[0]);
          if (state == 1) {
              message.channel.send(':white_check_mark: The counter has been correctly deleted.');
          } else if (state == 2) {
              message.channel.send('There is no counter with this name.');
          } else if (state == 3) {
              message.channel.send('You are not the owner of this counter.');
          }
      }
  } else if (cmd === 'log') {
      console.log(counters);
  } else if (cmd === "cleardb") {
      if (isOwner()) {
          counters = {};
          message.channel.send('Local database has been cleared.');
          saveToDisk();
      } else {
          message.channel.send(':x: **Error:** Only the owner can use this command.');
      }
  } else if (cmd === 'exit') {
      if (isOwner()) {
          message.channel.send('Stopping').then(x => {
              client.destroy();
              process.exit(0);
          });
      } else {
          message.channel.send(':x: **Error:** Only the owner can use this command.');
      }
  } else if (cmd === "upgradecounters") {
      if (isOwner()) {
          upgradeCounters();
          message.channel.send('Counters have been upgraded. You MUST restart the bot, or weird behaviour could happen.');
          saveToDisk();
      } else {
          message.channel.send(':x: **Error:** Only the owner can use this command.');
      }
  } else if (cmd === "uid") {
      message.channel.send('Your UID is : ' + message.author.id);

  } else if (cmd ===("listcounters")) {
      var output = '```\r\n';
      for (var key in counters) {
          output += counters[key].name + '\r\n';
      }
      output += '```';
      message.channel.send(output);
  } else {
      var counterName = cmd;
      if (counters[counterName]) {
          if (args.length == 0) {
              message.channel.send(getTextView(counterName));
          } else {
              if (args[0].startsWith('+')) {

                  if(!message.mentions.members.first() && !isStaff(message.member)){
                    message.channel.send(":x: **Error:** Please make sure you tag yourself properly after the +. e.g. `!students + @Eric#0820`");
                    return;
                  }

                  if(message.mentions.users.first() !== message.author && !isStaff(message.member)){
                    message.channel.send(":x: **Error:** Please only add to your own count.");
                    return;
                  }

                  var length = args[0].length;
                  if(length > 2 && !isStaff(message.member)){
                    message.channel.send(":x: **Error:** You don't have permission to add 10+ poms. Please contact a Guardian.");
                    return;
                  }

                  if (!parseInt(args[0].substring(1)) && length > 1){
                    message.channel.send(":x: **Error:** Please add poms using `!students + @<Username>`.");
                    return;
                  }

                  if (setValue(counterName, length == 1 ? "1" : message.content.substring(cmd.length + 3, cmd.length + 2 + length), '+', message.mentions.users)) {
                      message.channel.send(getTextPlus(counterName));
                  } else {
                      message.channel.send(":x: **Error:** There was an error parsing your input.");
                  }
              } else if (args[0].startsWith('-')) {
                  if(!isStaff(message.member)){
                    message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
                    return;
                  }
                  var length = args[0].length;
                  if (setValue(counterName, length == 1 ? "1" : message.content.substring(cmd.length + 3, cmd.length + 2 + length), '-', message.mentions.users)) {
                      message.channel.send(getTextMinus(counterName));
                  } else {
                      message.channel.send(":x: **Error:** There was an error parsing your input.");
                  }
              } else if (args[0] == 'reset') {
                  if(!isStaff(message.member)){
                    message.channel.send(":x: **Error:** You don't have permission to use this command. Please contact a Guardian.");
                    return;
                  }
                  resetValue(counterName);
                  message.channel.send(getTextReset(counterName));
              } else if (args[0] == 'value') {
                  if (args[1]) {
                      if (setValue(counterName, message.content.substring(cmd.length + 1 + args[0].length + 1), '=')) {
                          message.channel.send(getTextValue(counterName));
                      } else {
                          message.channel.send(":x: **Error:** There was an error parsing your input.");
                      }
                  }
              } else if (args[0] == 'edit') {
                  if (counters[counterName][args[2]]) {
                      var newValue = message.args.substr(message.content.indexOf(args[1]) + args[1].length + 1);
                      setCounterText(counterName, args[1], newValue);
                      message.channel.send('Property ' + args[1] + ' has been changed.');
                  }
              } else if (args[0] == 'show') {
                  if (counters[counterName][args[1]]) {
                      message.channel.send(args[1] + ' : ' + counters[counterName][args[1]]);
                  }
              } else if (args[0] == 'leaderboard' || args[0] == 'leadership') {
                  var sortable = [];

                  for (var key in counters[counterName].leaderboard) {
                      sortable.push(counters[counterName].leaderboard[key]);
                  }

                  sortable.sort(function (a, b) {
                      return b.value - a.value;
                  });

                  var output = '```\r\n';
                  output += getTextLeaderboard(counterName) + '\r\n\r\n';
                  for (var i = 0; i < sortable.length; i++) {
                      output += (i + 1) + '. ' + sortable[i].username + ' : ' + sortable[i].value + '\r\n';
                  }
                  output += '```';
                  message.channel.send(output);

              } else if (args[0] == 'clearleaderboard') {
                  if (isOwner()) {
                      counters[counterName].leaderboard = {};
                      message.channel.send('Leaderboard for ' + counterName + ' has been cleared.');
                      saveToDisk();
                  } else {
                      message.channel.send(':x: **Error:** Only the owner can use this command.');
                  }
              }
              saveToDisk();
          }
      }
  }
  if (cmd === 'habitica'){
    message.channel.send("Starting!");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://habitica.com/api/v3/tasks/user", true);
    xhr.setRequestHeader('x-api-user', '6c86e769-6127-41ab-94a9-61c30533cd8e');
    xhr.setRequestHeader('x-api-key',  'b9408ea0-6d6a-40c2-b210-86d4ce6a8bbe');
    xhr.send();
    xhr.onreadystatechange = function () {
      if(xhr.readyState == 4 && xhr.status == 200) {
        //message.channel.send(xhr.responseText.substring(1, 2000));
        console.log(xhr.responseText);
        //message.channel.send("Sending message to your console!");
        //var name = JSON.parse(xhr.responseText).data[0].text;
        var habits = [];
        var dailies = [];
        var todos = [];
        for(var num = 0; num < JSON.parse(xhr.responseText).data.length; num++){
          if(JSON.parse(xhr.responseText).data[num].type === 'habit'){
            habits.push(JSON.parse(xhr.responseText).data[num].text);
          } else if (JSON.parse(xhr.responseText).data[num].type === 'daily'){
            dailies.push(JSON.parse(xhr.responseText).data[num].text);
          } else if (JSON.parse(xhr.responseText).data[num].type === 'todo'){
            todos.push(JSON.parse(xhr.responseText).data[num].text);
          }

        }
        message.channel.send(`Habits:${habits}\n\nDailies:${dailies}\n\nTo-Dos:${todos}`);
        //message.channel.send(name);
        //var habits = JSON.parse(xhr.responseText).tasksOrder[0];
        //message.channel.send(habits[1]);

        //message.channel.send(JSON.parse(xhr.responseText).tasksOrder.habits.toString());

        //message.channel.send(xhr.responseText.substring(1,2000));
        //message.channel.send(xhr.responseText.substring(2000,4000));
        //message.channel.send(xhr.responseText.substring(6000,8000));
        //var count = JSON.parse(xhr.responseText).data.memberCount;
        //message.channel.send(`The current member count for the KOA Guild is: ${count}`);
        return;
      }
    }

  }

});

client.login(token);

function isStaff(member){
  if(member.roles.find("name", 'Dreamers')){
    return true;
  } else if (member.id == ownerID){
    return true;
  }

  return false;
}

function addCounter(id, title) {
    if (inputFilter.test(title) && title != "addcounter" && title != "delcounter" && title != "ac" && title != "dc") {
        if (counters[title]) {
            return 2;
        } else {
            counters[title] = JSON.parse(JSON.stringify(dummy));
            counters[title].owner = id;
            counters[title].name = title;
            saveToDisk();
            return 1;
        }
    } else {
        return 3;
    }
}

function getTextView(title) {
    return counters[title].textView.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextPlus(title) {
    return counters[title].textPlus.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextMinus(title) {
    return counters[title].textMinus.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextReset(title) {
    return counters[title].textReset.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextValue(title) {
    return counters[title].textValue.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function getTextLeaderboard(title) {
    return counters[title].textLeaderboard.replace('%name%', counters[title].name).replace('%value%', counters[title].value);
}

function setCounterText(title, textToChange, newText) {
    counters[title][textToChange] = newText;
}

function resetValue(title) {
    setValue(title, dummy.value, '=', []);
}

function setValue(title, value, operator, mentions) {
    try {
        var val = math.eval(value);

        // ensure that each mentionned user is present in the leaderboard, creating them when needed

        mentions.forEach(function (value2) {
            if (!counters[title].leaderboard[value2.id]) {
                counters[title].leaderboard[value2.id] = {
                    id: value2.id,
                    username: value2.username,
                    value: 0
                };
            }
        });

        switch (operator) {
            case '+':
                counters[title].value += val;
                mentions.forEach(function (value) {
                    counters[title].leaderboard[value.id].value += val;
                });
                break;
            case '-':
                counters[title].value -= val;
                mentions.forEach(function (value) {
                    counters[title].leaderboard[value.id].value -= val;
                });
                break;
            case '=':
                counters[title].value = val;
                mentions.forEach(function (value) {
                    counters[title].leaderboard[value.id].value = val;
                });
                break;
        }
        return true;
    } catch (err) {
        return false;
    }
}

function getValue(title) {
    // since the value can be invalide due to the edit command, we check that it is an integer and reset it when needed
    var val = parseInt(counters[title].value);
    if (isNaN(val)) {
        counters[title].value = val = 0;
    }
    return val;
}

function getStep(title) {
    // since the value of step can be invalide due to the edit command, we check that it is an integer and reset it when needed
    var val = parseInt(counters[title].step);
    if (isNaN(val)) {
        counters[title].step = val = 1;
    }
    return val;
}

function delCounter(id, title) {
    if (inputFilter.test(title)) {
        if (counters[title]) {
            if (id != counters[title].owner && id != ownerID) {
                return 3;
            } else {
                delete counters[title];
                return 1;
            }
        } else {
            return 2;
        }

    } else {
        return 2;
    }
}

function saveToDisk() {
    fs.writeFile('counters.json', JSON.stringify(counters), "utf8", err => {
        if (err) throw err;
        console.log('Counters successfully saved!');
    });
}

// this function take the existing counters and upgrade them to the newest counter prototype
function upgradeCounters() {
    for (var key in counters) {
        if (!counters.hasOwnProperty(key)) continue;

        for (var key2 in dummy) {
            if (!dummy.hasOwnProperty(key2)) continue;

            if (!counters[key][key2]) {
                counters[key][key2] = dummy[key2];
            }
        }
    }
}
