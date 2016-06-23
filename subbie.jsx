import React from 'react'
import ReactDOM from 'react-dom'

export class Subbie {
  constructor(thing, ev, promiser){
    this.thing = thing
    this.ev = ev
    this.promiser = promiser
  }

  then(cb){
    if (this.promiser) this.promiser().then(cb)
    else if (this.thing.on) this.thing.once(ev).then(cb)
    else this.thing('once', cb)
  }

  always(cb){
    if (this.promiser) this.handler = () => this.promiser().then(cb)
    else this.handler = cb
    if (this.thing.on) this.thing.on(this.ev, this.handler)
    else this.thing('on', this.handler)
    if (this.promiser) this.then(cb)
  }

  cancel(){
    if (this.thing.off) this.thing.off(this.ev, this.handler)
    else this.thing('off', this.handler)
  }
}

export class SubbieSignal {
  constructor(){ this.ls = [] }
  fire(){ this.ls.forEach(x => x()) }
  on(ev, cb){ this.ls.push(cb); }
  off(ev, cb){ this.ls.splice(this.ls.indexOf(cb), 1) }
}

export class SubbieArray {
  constructor(){
    this.array = []
    this.sig = new SubbieSignal()
  }
  push(x){
    this.array.push(x)
    this.sig.fire()
  }
  remove(x){
    let pos = this.array.indexOf(x)
    if (pos == -1) return
    this.array.splice(pos, 1)
    this.sig.fire()
  }
  subscription(){
    return new Subbie(this.sig, null, () => Promise.resolve(this))
  }
  map(cb){
    return this.array.map(cb)
  }
}

export class With extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
    this.subs = []
  }

  componentWillMount(){
    for (let k in this.props){
      if (k == 'children') continue;
      let promiselike = this.props[k]

      if (!promiselike.always && !promiselike.then)
        promiselike = new Subbie(promiselike)

      if (promiselike.always){
        let sub = promiselike.always( val => {
          this.setState({[k]: val})
        })
        this.subs.push(sub)
      } else {
        promiselike.then( val => this.setState({[k]: val}) )
      }
    }
  }

  componentWillUnmount(){
    this.subs.forEach(sub => sub.cancel && sub.cancel())
    this.subs = []
  }

  render(){
    return <div>
      {
        React.Children.map(this.props.children, c => (
          React.cloneElement(c, this.state)
        ))
      }
    </div>
  }

}
