import { SlashCommandBuilder } from "discord.js";

const PLAYER_ROLE_ID = "PUT_PLAYER_ROLE_ID_HERE";
const FREE_AGENT_ROLE_ID = "PUT_FREE_AGENT_ROLE_ID_HERE";

const NBA_TEAMS = [
{
name: "New York Knicks",
roleId: "PUT_KNICKS_ROLE_ID_HERE",
hcId: "PUT_HC_USER_ID_HERE",
roster: [],
},

// Add your other teams here
];

export default {
data: new SlashCommandBuilder()
.setName("sign")
.setDescription("Sign a player to your team")
.addUserOption(option =>
option
.setName("player")
.setDescription("Player to sign")
.setRequired(true)
),

async execute(interaction) {
const player = interaction.options.getMember("player");


const team = NBA_TEAMS.find(
  t => t.hcId === interaction.user.id
);

if (!team) {
  return interaction.reply({
    content: "❌ You are not a Head Coach.",
    ephemeral: true,
  });
}

if (team.roster.includes(player.id)) {
  return interaction.reply({
    content: "❌ That player is already on your roster.",
    ephemeral: true,
  });
}

team.roster.push(player.id);

await player.roles.add([
  PLAYER_ROLE_ID,
  team.roleId,
]);

await player.roles.remove(FREE_AGENT_ROLE_ID);

await interaction.reply({
  content: `✅ ${player} has signed with **${team.name}**!\nRoster Count: **${team.roster.length}/15**`,
});


},
};

