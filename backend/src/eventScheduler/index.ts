import Persistable = require("../persistance/persistable.js");
import Factory = require("../persistance/factory.js");
import MemberFactory = require("../user/memberFactory.js");
import log = require("../log/index.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

interface IScheduledEvent {
  timestamp: Date,
  event: "test" | "pardon",
  args: string[]
}

const schema = {
  timestamp: Date,
  event: String,
  args: Array
}

const dbOptions = {name: "scheduledEvents", schema: schema};

const eventScheduler = {
  async init(): Promise<void> {
    await eventScheduler.deleteOldEvents();

    const allEvents = await eventScheduler.getAll();

    allEvents.forEach(async x => {
      try {
        setTimeout(() => events[x.event](x.args), x.timestamp.valueOf() - Date.now());
      } catch (e) {
        log.write(3, "eventScheduler", "event threw", {event: x, error: e.message});
      }
    });
  },

  async schedule(timestamp: Date, event: string, args: string[]): Promise<IScheduledEvent> {
    const persistable = new Persistable(dbOptions);
    await persistable.init();

    if(event != "test" && event != "pardon") {
      throw new Error("Given event not supported");
    }

    const eventData: IScheduledEvent = {
      timestamp: timestamp,
      event: event,
      args: args
    }

    persistable.data = eventData;

    await persistable.create();

    try {
      setTimeout(() => events[eventData.event](eventData.args), eventData.timestamp.valueOf() - Date.now());
    } catch(e) {
      log.write(3, "eventScheduler", "event threw", {event: eventData, error: e.message});
    }

    return persistable.data;
  },

  async getAll(): Promise<IScheduledEvent[]> {
    const factory = new Factory(dbOptions);
    await factory.connect();
    return factory.persistanceProvider.retrieveAll();
  },

  async deleteOldEvents(): Promise<void> {
    const factory = new Factory(dbOptions);
    await factory.connect();
    await factory.persistanceProvider.deleteByFilter({timestamp: {$lt: new Date()}});
  },

  dbOptions: dbOptions
}

const events = {
  async pardon(args: string[]) {
    const member = await memberFactory.getByDiscordId(args[0]);
    await member.pardonInGame();
  },

  test(_args: string[]) {}
}

export = eventScheduler;