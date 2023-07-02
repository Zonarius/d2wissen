const datalistId = "gheed-helper-base-items";

function GheedHelper() {

  return <>    
    <h1>Gheed Helper</h1>
    <datalist id={datalistId}>
      <option label="" value=""></option>
    </datalist>
    <input type="search" placeholder="Enter base item" list={datalistId}/>
  </>
}

export default GheedHelper