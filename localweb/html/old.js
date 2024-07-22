
document.getElementById("runButton").addEventListener("click", async function() {
	var fmo = await jsstp.get_fmo_infos();
	jsstp.SEND({
		"Script": "\\C\\![raiseplugin,c58b6320-caf8-11ed-a901-0800200c9a66,OnWalletOfUnyu,menu]\\e",
		"ID": fmo.keys[0]
	})
});
