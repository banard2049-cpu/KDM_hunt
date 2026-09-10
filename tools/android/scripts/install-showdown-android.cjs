const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),java=path.join(root,'android/app/src/main/java/com/kdmhunt/hunt');
if(!fs.existsSync(java))throw Error('Run capacitor add android first');
fs.copyFileSync(path.join(root,'tools/android/native/ShowdownHostPlugin.java'),path.join(java,'ShowdownHostPlugin.java'));
const file=path.join(java,'MainActivity.java');let text=fs.readFileSync(file,'utf8');
if(!text.includes('registerPlugin(ShowdownHostPlugin.class)')){
 text=text.replace(/public class MainActivity extends BridgeActivity\s*\{/,`public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(ShowdownHostPlugin.class);
        super.onCreate(savedInstanceState);
    }
 `);fs.writeFileSync(file,text);
}
console.log('Installed native ShowdownHost plugin');
