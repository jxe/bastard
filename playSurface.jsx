// TODO: material design floating plus menu (30min)
// TODO: get rid of colors in favor of .done, .notyet, etc

import React from 'react'
import { SubbieArray, With } from './subbie.jsx'
import Engine from './engine.js'
import Interpreter from './interpreter.js'
var engine
let tempCards = new SubbieArray()


let labeledCards = (round, playerId) => {
  let { values={} } = round
  return Object.keys(round.cards).map(no => {
    let card = round.cards[no]
    let status = engine.status(card, round, playerId)
    for (var k in status) card[k] = status[k]

    card.dimmed = true
    if (status.done || status.wasMe){
      card.color = 'green'
      card.explanation = 'already done'
    } else if (status.notyet){
      card.color = 'grey'
      card.explanation = 'cannot be done yet'
    } else if (status.tossed || !status.fits){
      card.color = 'blue'
      card.explanation = 'waiting on other people'
    } else {
      card.color = 'blue'
      card.dimmed = false
    }

    console.log(card)
    return card
  })
}

function shuffle(cards){
  let green = [], other = []
  cards.forEach(c => {
    if (c.color == 'green') green.push(c)
    else other.push(c)
  })
  return other.concat(green)
}


let play = (card, round, player, value) => {
  tempCards.remove(card)
  if (card.dimmed) return;
  engine.play(card, round, player, value)
}

let StatusReport = ({card, round}) => {
  if (card.color == 'green'){
    if (card.type == 'ask') return <div className='status'>
      {`${card.collects} = ${round.values[card.collects]}`}
    </div>

    if (card.type == 'charge') return <div className='status'>
      ➔ Task accepted
    </div>
  } else return <div className='status'>{card.explanation}</div>
}

let Recipients = ({recipients}) => {
  if (!recipients || !recipients.length) return false
  return <h4>{
      `To: ${recipients.map(r => r.displayName)}`
  }</h4>
}

let BasicCard = ({card, player, round, children}) => {
  let deliberative = card.deliberative && round && (!card.dimmed || card.color=='green')
  return <div className={`CardContainer ${card.color || 'blue'}`}>
    <div className={`Card ${card.type} ${card.color || 'blue'} ${card.dimmed && 'dimmed'}`} title={card.line}>
      <a className="tosser" onClick={
          () => round ? engine.toss(card, player.uid) : tempCards.remove(card)
        }>X</a>
      {
        <Recipients recipients={card.recipients} round={round} />
      }
      <h3 dangerouslySetInnerHTML={{__html: card.expandedText || card.text}}></h3>
      {
        card.dimmed ? <StatusReport card={card} round={round}/> : <div className="ui">{children}</div>
      }
      </div>
    {deliberative && <ChatRoom card={card} player={player} round={round} />}
  </div>
}

let AskCard = ({card, player, round}) => (
  <BasicCard card={card} player={player} round={round}>{
      <form onSubmit={ ev => {
        ev.preventDefault()
        play(card, round, player, ev.target[0].value)
      }}>
      <input/>
    </form>
  }</BasicCard>
)

let ChargeCard = ({card, player, round}) => (
  <BasicCard card={card} player={player} round={round}>
    <button onClick={() => play(card, round, player)}>I'm in!</button>
  </BasicCard>
)

let ChatRoom = ({card, player, round}) => {
  let chat = round && round.chats && round.chats[card.no]
  return <div className="ChatRoom">
    <ul className="Chats">
      { chat && Object.keys(chat).map(x => <li> {chat[x].name}: {chat[x].text} </li>) }
    </ul>
    <form className="Entry" onSubmit={
        ev => {
          ev.preventDefault()
          engine.chat(card, {name:player.displayName, text:ev.target[0].value})
        }
      }>
      <input placeholder="Post a comment"/>
    </form>
  </div>
}

let CardTypes = { ask:AskCard, charge:ChargeCard }

let Cards = ({cards, player, round, className}) => (
  <div className={className}>{
      (cards||[]).map( c => {
        let Type = CardTypes[c.type]
        return c && <Type key={`${c.round}:${c.no}`} card={c} player={player} round={round}/>
      })
  }</div>
)

let PlaySurface = ({player, startCards, tempCards, storage}) => {
  if (storage && storage.val) storage = storage.val()
  let rounds = storage ? storage.rounds || {} : {}
  return <div>
    <div>
      <Cards key="tempCards" className="Bin" cards={tempCards} player={player}/>
      {
        Object.keys(rounds).sort().reverse().map(k => (
          <Cards
            key={k}
            className="Bin"
            cards={shuffle(labeledCards(rounds[k], player.uid))}
            player={player}
            round={rounds[k]}
            />
        ))
      }
    </div>
    <div className="startCards">
      <h3>Start something!</h3>
      <ul>
      {
        startCards.map( card => (
          <li key={card.no}>
            <button onClick={() => { tempCards.push(card) }}>
              {card.heading}
            </button>
          </li>
        ))
      }
      </ul>
    </div>
  </div>
}


let PlaySurfaceContainer = ({storage, player, script}) => {
  engine = new Engine(storage)
  try {
    let startCards = Interpreter(script)
    return <With
      tempCards={tempCards.subscription()}
      storage={engine.rounds()}
      >
      <PlaySurface player={player} startCards={startCards} />
      <hr/>
      <h3>Script</h3>
      <pre>{script}</pre>
    </With>
  } catch (e){
    return <pre>
      Script error: ${e} ${e.message}
    </pre>
  }
}


export default PlaySurfaceContainer
