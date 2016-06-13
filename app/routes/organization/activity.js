import RSVP from 'rsvp'
import Route from 'ember-route'
import injectService from 'ember-service/inject'

import {
  task,
  timeout
} from 'ember-concurrency'

const QUARTER_HOUR = 1000 * 60 * 15

export default Route.extend({
  github: injectService(),
  perPage: 50,

  refreshTask: task(function* () {
    while (true) {
      yield timeout(QUARTER_HOUR)
      this.refresh()
    }
  }).on('activate'),

  model() {
    let organization = this.modelFor('organization')

    return organization.get('githubUsers')
      .then(members =>
        RSVP.all(
          members
            .map(member => member.get('login'))
            .map(login =>
              this.get('github').request(`/users/${login}/events/public`, {
                data: { 'per_page': this.perPage }
              })
            )
        )
        .then(memberFeeds =>
          memberFeeds.reduce((feeds, memberFeed) =>
            feeds.concat(memberFeed)
          , [])
        )
        .then(feed => {
          feed.forEach(event => {
            event.created_at = new Date(event.created_at)
          })
          return feed
        })
        .then(feed =>
          feed.sort((a, b) => b.created_at - a.created_at)
        )
        .then(feed =>
          feed.slice(0, this.perPage)
        )
      )
  }
})
