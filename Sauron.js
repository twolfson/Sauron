// Better sentences
// Sauron.create.an.app => Sauron.create().an('app')
// Sauron.when.an.app.is.created/isCreated => Sauron.when().an('app').is().created()
// Sauron.an.app.has.been.created => Sauron.an('app').has().been().created()
// Sauron.start.main
// Sauron.stop.login
// Sauron.ignore.when.an.app.is.created => Sauron.ignore(fn).when().an.app.is.created() -- note, a false positive is possible if when('') is used x_x
// Sauron.the.next.time.an.app.is.created => Sauron.the().next().time().an().app().is().created()
// These sentences are getting a bit lengthy o_o

// FUCK CHAINING

define('Sauron', function () {
  var MiddleEarth = {},
      Sauron = {};

  function Palantir() {
    this.stack = [];
  }
  function popStack() {
    return this.stack.pop();
  }
  var PalantirProto = Palantir.prototype = {
    'channel': function () {
      var stack = this.stack,
          controller = this.controller,
          model = this.model,
          channel = stack[stack.length - 1] || '';

      // If there is a controller, prefix the channel
      if (controller !== undefined) {
        channel = 'controller/' + controller + '/' + channel;
      } else if (model !== undefined) {
      // Otherwise, if there is a model, prefix the channel
        channel = 'model/' + model + '/' + channel;
      }

      return channel;
    },
    'pushStack': function (channel) {
      this.stack.push(channel);
    },
    'popStack': popStack,
    'end': popStack,
    'of': function (subchannel) {
      var lastChannel = this.channel(),
          channel = lastChannel + '/' + subchannel;
      this.pushStack(channel);
      return this.clone();
    },
    'on': function (subchannel, fn) {
      // Move the track to do an 'on' action
      this.method = 'on';

      // If there are are arguments
      if (arguments.length > 0) {
        // If there is only one argument and subchannel is a function, promote the subchannel to fn
        if (arguments.length === 1 && typeof subchannel === 'function') {
          fn = subchannel;
          subchannel = null;
        }

        // If there is a subchannel, add it to the current channel
        if (subchannel) {
          this.of(subchannel);
        }

        // If there is a function
        if (fn) {
          // Get the proper channel
          var channelName = this.channel(),
              channel = MiddleEarth[channelName];

          // If the channel does not exist, create it
          if (channel === undefined) {
            channel = [];
            MiddleEarth[channelName] = channel;
          }

          // Save the context to the function
          fn.SAURON_CONTEXT = this;

          // Add the function to the channel
          channel.push(fn);

          // This is a terminal event so return Sauron
          return Sauron;
        }
      }

      // Return a clone
      return this.clone();
    },
    'off': function (subchannel, fn) {
      // Move the track to do an 'off' action
      this.method = 'off';

      // If there are are arguments or there is a function
      fn = fn || this.fn;
      if (arguments.length > 0 || fn) {
        // If there is only one argument and subchannel is a function, promote the subchannel to fn
        if (arguments.length === 1 && typeof subchannel === 'function') {
          fn = subchannel;
          subchannel = null;
        }

        // If there is a subchannel, add it to the current channel
        if (subchannel) {
          this.of(subchannel);
        }

        // If there is a function
        if (fn) {
          // Get the proper channel
          var channelName = this.channel(),
              channel = MiddleEarth[channelName] || [],
              i = channel.length;

          // Loop through the subscribers
          while (i--) {
            // If an functions match, remove them
            if (channel[i] === fn) {
              channel.splice(i, 1);
            }
          }

          // This is a terminal event so return Sauron
          return Sauron;
        }
      }

      // Return a clone
      return this.clone();
    },
    'voice': function () {
      // Collect the data and channel
      var args = [].slice.call(arguments),
          channelName = this.channel(),
          channel = MiddleEarth[channelName] || [],
          subscriber,
          i = 0,
          len = channel.length;

      // Loop through the subscribers
      for (; i < len; i++) {
        subscriber = channel[i];

        // Call the function within its original context
        subscriber.apply(subscriber.SAURON_CONTEXT, args);
      }

      // This is a terminal event so return Sauron
      return Sauron;
    },
    'clone': function () {
      var that = this,
          retObj = new Palantir(),
          key;

      for (key in that) {
        if (that.hasOwnProperty(key)) {
          retObj[key] = that[key];
        }
      }

      // Special treatment for the stack
      retObj.stack = [].slice.call(that.stack);

      // Return the modified item
      return retObj;
    }
  };

  // Copy over all of the items in the Palantir prototype to Sauron such that each one is run on a fresh Palantir
  for (key in PalatirProto) {
    if (PalantirProto.hasOwnProperty(key)) {
      (function (fn) {
        Sauron[key] = function () {
          var args = [].slice.call(arguments);
          return fn.apply(new Palantir(), args);
        };
      }(PalantirProto[key]));
    }
  }

  return Sauron;
});