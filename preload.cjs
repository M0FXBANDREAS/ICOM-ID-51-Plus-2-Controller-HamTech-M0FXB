'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{choosePort:id=>ipcRenderer.send('serial-choice',id),onPorts:callback=>{ipcRenderer.on('serial-ports',(_event,ports)=>callback(ports))},onSelected:callback=>{ipcRenderer.on('serial-selected',(_event,port)=>callback(port))},onSetup:callback=>{ipcRenderer.on('open-setup',()=>callback())}});
