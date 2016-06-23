let EXPANSIONS = /\B@(\w+)\b/g
let DIRECTIVE = /^(ask|charge)(\*)? (.*?)( ➔\w+)?: (.*)$/
let HEADING = /^"(.*)"$/
let BLANK_LINE = /^\s*$/
let COMMENT = /^(#|\/\/|--).*$/

let Interpreter = script => {
  var m

  let parseRoles = (roles) => {
    let criteria = [], knownRoles = []
    roles.split(/\s*(?:,|&)\s*/).forEach(role => {
      if (m = role.match(/some:(\w+)/)){
        criteria.push({castAs:{length:0},unknown:[m[1]],casts:m[1]})
      } else if (role == 'others'){
        criteria.push({castAs:{length:0}})
      } else if (role.match(/everyone/)){
        criteria.push({})
      } else {
        knownRoles.push(role)
        criteria.push({castAs:[role],known:[]})
      }
    })
    knownRoles.forEach(r => criteria.forEach(cr => cr.known.push(r)))
    return {
      criteria:criteria,
      aggregate: roles.match(/others|whoever|everyone|&/)
    }
  }

  let cards = []
  var prevHeading, topCard
  script.replace(/:\s*\n\s+/g,': ').split(/\n/).forEach((line, lineNo) => {
    if (m = line.match(HEADING)){
      prevHeading = m[1]
    } else if (line.match(BLANK_LINE) || line.match(COMMENT)) {
      // comment or empty line
    } else if (m = line.match(DIRECTIVE)){
      let roles = m[3]
      let card = {
        no: lineNo,
        line: line,
        type: m[1],
        collects: m[4] ? m[4].slice(2) : `accept${lineNo}`,
        deliberative: m[2],
        text: m[5],
        heading: prevHeading
      }
      for (var k in card) if (!card[k]) delete card[k]
      let roleData = parseRoles(roles)
      for (var k in roleData) card[k] = roleData[k]

      // add some extra requirements
      let expansions = card.text.match(EXPANSIONS) || []
      card.criteria.forEach(cr => {
        if (card.collects){
          if (!cr.unknown) cr.unknown = []
          cr.unknown.push(card.collects)
        }
        expansions.forEach(x => {
          if (!cr.known) cr.known = []
          cr.known.push(x.slice(1))
        })
      })

      if (card.heading){
        topCard = card
        card.children = []
        card.script = script
        prevHeading = null
        cards.push(card)
      } else if (topCard) {
        cards[cards.length-1].children.push(card)
      } else {
        throw "The first directive of your script needs a heading"
      }
    } else {
      throw `Unrecognized line: ${line}`
    }
  })
  return cards
}

export default Interpreter
