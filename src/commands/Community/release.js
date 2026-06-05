
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
    .setName("release")
    .setDescription("Release a player from your team")
    .addUserOption(option =>
      option
        .setName("player")
        .setDescription("Player to release")
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

    if (!team.roster.includes(player.id)) {
      return interaction.reply({
        content: "❌ That player is not on your roster.",
        ephemeral: true,
      });
    }

    team.roster = team.roster.filter(
      id => id !== player.id
    );

    await player.roles.remove([
      PLAYER_ROLE_ID,
      team.roleId,
    ]);

    await player.roles.add(
      FREE_AGENT_ROLE_ID
    );

    await interaction.reply({
      content: `📄 ${player} has been released by **${team.name}**!\nRoster Count: **${team.roster.length}/15**`,
    });
  },
};


