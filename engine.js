let EXPANSIONS = /\B@(\w+)\b/g

export default class Engine {
  constructor(fbRef){ this.base = fbRef }
  chat(c,m){ this.base.child(`rounds/${c.round}/chats/${c.no}`).push(m) }
  rounds(){ return (m,cb) => this.base[m]('value', cb) }

  play(card, round, player, response = true){
    let cardsToAdd = [], status = this.status(card, round, player.uid)
    let update = {}, {fits,done,notyet} = status
    if (!fits || done || notyet) return

    if (!card.round) {
      card.round = `round${Date.now()}`;
      cardsToAdd.push(card)
    }

    let children = card.children || []
    delete card.children
    children.forEach( c => { c.round = card.round; cardsToAdd.push(c) })

    let path = `rounds/${card.round}`
    if (fits.casts) update[`${path}/values/${fits.casts}`] = player
    if (card.collects && card.aggregate){
      update[`${path}/aggregates/${card.collects}/${player.uid}`] = response
    } else if (card.collects) {
      update[`${path}/values/${card.collects}`] = response
    }
    update[`${path}/playedBy/${card.no}/${player.uid}`] = true
    update[`roster/${player.uid}`] = player
    cardsToAdd.forEach( c => update[`${path}/cards/${c.no}`] = c )
    this.base.update(update)
  }

  toss(card, playerId){
    if (!card.round) return
    this.base.child(`${card.round}/tosses/${card.no}/${playerId}`).set(true)
  }

  status(card, round={}, playerId){
    let {criteria=[], aggregate} = card
    let {values={}, aggregates={}, playedBy={}, tosses={}} = round
    let roles = Object.keys(values).filter( x => values[x].uid == playerId)

    let known = key => (
      (aggregates[key] && aggregates[key][playerId]) || values[key]
    )

    criteria.forEach(cr => {
      if (!cr.known) cr.known = []
      if (!cr.unknown) cr.unknown = []
    })

    return {
      done: criteria.every(cr => cr.unknown.every(k => known(k))),
      notyet: criteria.every(cr => cr.known.some(k => !known(k))),
      fits: criteria.find(cr => (
        cr.known.every(  k => known(k)) &&
        cr.unknown.every(k => !known(k)) &&
        (
          !cr.castAs ||
          cr.castAs.length == roles.length &&
          roles.every(r => cr.castAs.indexOf(r) != -1)
        )
      )),
      wasMe: playedBy[card.no] && playedBy[card.no][playerId],
      tossed: tosses[card.no] && tosses[card.no][playerId],
      expandedText: card.text.replace(EXPANSIONS, (_,key) => {
        let value = known(key)
        if (!value) return `<i>${key}</i>`
        if (value.displayName) value = value.displayName
        return `<b>${value}</b>`
      }),
      recipients: criteria.map(cr => cr.castAs).reduce(
        (a, b) => a.concat(b||[]),[]
      ).map(known).filter(x => x)
    }
  }
}
