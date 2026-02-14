import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";

const ele_data = {
  ELE_DATA_URL: "https://cdn.jsdelivr.net/gh/krabat1/ELE_DATA/data.json",
  ELE_VERSION_URL: "https://cdn.jsdelivr.net/gh/krabat1/ELE_DATA/version.json",
  LOCAL_DATA_KEYNAME: "dataObj",
  LOCAL_VERSION_KEYNAME: "versionObj",
  remoteHash: '',

  // Egyszerű SHA-256 hash függvény a böngészőben
  async generateHash(string) {
    const msgUint8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },
  async sync_data() {
    this.remoteHash = await this.fetchEleVersion();
    let start = new Date().getTime();
    if (localStorage.getItem(this.LOCAL_VERSION_KEYNAME) === null) {
      Dev.log(LT.SYNC,'NO LOCAL VERSION HASH')
      let remoteData = await this.fetchEleData();
      let remoteIsConsistent = await this.checkConsistency('remoteHash-remoteData',this.remoteHash, remoteData);
      if (remoteIsConsistent) {
        // mehet bele localStorage-ba
        this.storeData(this.remoteHash, remoteData)
      }
    } else {
      Dev.log(LT.SYNC,'WE HAVE LOCAL VERSION HASH')
      let localHash = localStorage.getItem(this.LOCAL_VERSION_KEYNAME);
      if (localHash == this.remoteHash) {
        Dev.log(LT.SYNC,'LOCAL VERSION HASH IS UP-TO-DATE')
        if (localStorage.getItem(this.LOCAL_DATA_KEYNAME) === null) {
          Dev.log(LT.SYNC,'NO LOCAL DATA')
          let remoteData = await this.fetchEleData();
          let remoteIsConsistent = await this.checkConsistency('hash-remoteData',
            this.remoteHash,
            remoteData,
          );
          if (remoteIsConsistent) {
            // mehet bele localStorage-ba
            this.storeData(this.remoteHash, remoteData)
          }
        } else {
          Dev.log(LT.SYNC,'WE HAVE LOCAL DATA')
          let localData = localStorage.getItem(this.LOCAL_DATA_KEYNAME);
          if(typeof localData != 'string') Dev.log(LT.SYNC,new Error('WE STORE DATA ONLY AS TEXT!'))
          let localIsConsistent = await this.checkConsistency('hash-localData',this.remoteHash, localData);
          if (!localIsConsistent) {
            Dev.log(LT.SYNC,'LOCAL DATA IS NOT CONSISTENT, GET REMOTE DATA')
            let remoteData = await this.fetchEleData();
            let remoteIsConsistent = await this.checkConsistency('hash-remoteData',
              this.remoteHash,
              remoteData,
            );
            if (remoteIsConsistent) {
              // mehet bele localStorage-ba
              this.storeData(this.remoteHash, remoteData)
            }
          } else {
            Dev.log(LT.SYNC,'DO NOTHING, HASH AND DATA IS UP-TO-DATE!')
          }
        }
      } else {
        Dev.log(LT.SYNC,'LOCAL VERSION HASH IS EXPIRED')
        let remoteData = await this.fetchEleData();
        let remoteIsConsistent = await this.checkConsistency('hash-remoteData',this.remoteHash, remoteData);
        if (remoteIsConsistent) {
          // mehet bele localStorage-ba
          this.storeData(this.remoteHash, remoteData)
        }
      }
    }
    let end = new Date().getTime();
    Dev.log(LT.SYNC, `Sync duration: ${end - start}ms`);
  },

  storeData(hash, dataString){
    let data;
    if(typeof dataString == 'string'){
      data = dataString
    }else{
      data = JSON.stringify(dataString)
    }
    localStorage.setItem(this.LOCAL_DATA_KEYNAME, data)
    localStorage.setItem(this.LOCAL_VERSION_KEYNAME, hash)
    Dev.log(LT.SYNC,'HASH AND DATA STORED IN LOCALSTORAGE')
  },

  async checkConsistency(whatWeWatching, hash, data) {
    /*if(typeof data != 'string'){
      Dev.log(LT.SYNC,"WE MAKE HASH JUST FROM STRING!")
      data = JSON.stringify(data)
    }*/
    let hashFromData = await this.generateHash(data);
    let result = (hash == hashFromData)
    if(!result) Dev.log(LT.SYNC, whatWeWatching, {hash}, {hashFromData})
    return result
  },

  async fetchEleVersion() {
    try {
      const response = await fetch(`${this.ELE_VERSION_URL}?t=${Date.now()}`);
      const remote = await response.json();
      return remote.fullHash;
    } catch (error) {
      Dev.log(LT.SYNC, new Error(error), { error });
    }
  },
  async fetchEleData() {
    try {
      const response = await fetch(`${this.ELE_DATA_URL}?v=${this.remoteHash}`);
      //const remote = await response.json();
      const remote = await response.text(); // HASH JUST FROM TEXT !!!
      return remote;
    } catch (error) {
      Dev.log(LT.SYNC, new Error(error), { error });
    }
  },
};

export default ele_data;