
import { SlashCommandBuilder } from "discord.js";

const HEAD_COACH_ROLE_ID = "PUT_HEAD_COACH_ROLE_ID_HERE";
const GENERAL_MANAGER_ROLE_ID = "PUT_GENERAL_MANAGER_ROLE_ID_HERE";
const PLAYER_ROLE_ID = "PUT_PLAYER_ROLE_ID_HERE";
const FREE_AGENT_ROLE_ID = "PUT_FREE_AGENT_ROLE_ID_HERE";

const NBA_TEAMS = [
  { name: "Atlanta Hawks", roleId: "PUT_HAWKS_ROLE_ID_HERE" },
  { name: "Boston Celtics", roleId: "PUT_CELTICS_ROLE_ID_HERE" },
  { name: "Brooklyn Nets", roleId: "PUT_NETS_ROLE_ID_HERE" },
  { name: "Charlotte Hornets", roleId: "PUT_HORNETS_ROLE_ID_HERE" },
  { name: "Chicago Bulls", roleId: "PUT_BULLS_ROLE_ID_HERE" },
  { name: "Cleveland Cavaliers", roleId: "PUT_CAVS_ROLE_ID_HERE" },
  { name: "Dallas Mavericks", roleId: "PUT_MAVS_ROLE_ID_HERE" },
  { name: "Denver Nuggets", roleId: "PUT_NUGGETS_ROLE_ID_HERE" },
  { name: "Detroit Pistons", roleId: "PUT_PISTONS_ROLE_ID_HERE" },
  { name: "Golden State Warriors", roleId: "PUT_WARRIORS_ROLE_ID_HERE" },
  { name: "Houston Rockets", roleId: "PUT_ROCKETS_ROLE_ID_HERE" },
  { name: "Indiana Pacers", roleId: "PUT_PACERS_ROLE_ID_HERE" },
  { name: "LA Clippers", roleId: "PUT_CLIPPERS_ROLE_ID_HERE" },
  { name: "Los Angeles Lakers", roleId: "PUT_LAKERS_ROLE_ID_HERE" },
  { name: "Memphis Grizzlies", roleId: "PUT_GRIZZLIES_ROLE_ID_HERE" },
  { name: "Miami Heat", roleId: "PUT_HEAT_ROLE_ID_HERE" },
  { name: "Milwaukee Bucks", roleId: "PUT_BUCKS_ROLE_ID_HERE" },
  { name: "Minnesota Timberwolves", roleId: "PUT_WOLVES_ROLE_ID_HERE" },
  { name: "New Orleans Pelicans", roleId: "PUT_PELICANS_ROLE_ID_HERE" },
  { name: "New York Knicks", roleId: "PUT_KNICKS_ROLE_ID_HERE" },
  { name: "Oklahoma City Thunder", roleId: "PUT_THUNDER_ROLE_ID_HERE" },
  { name: "Orlando Magic", roleId: "PUT_MAGIC_ROLE_ID_HERE" },
  { name: "Philadelphia 76ers", roleId: "PUT_SIXERS_ROLE_ID_HERE" },
  { name: "Phoenix Suns", roleId: "PUT_SUNS_ROLE_ID_HERE" },
  { name: "Portland Trail Blazers", roleId: "PUT_BLAZERS_ROLE_ID_HERE" },
  { name: "Sacramento Kings", roleId: "PUT_KINGS_ROLE_ID_HERE" },
  { name: "San Antonio Spurs", roleId: "PUT_SPURS_ROLE_ID_HERE" },
  { name: "Toronto Raptors", roleId: "PUT_RAPTORS_ROLE_ID_HERE" },
  { name: "Utah Jazz", roleId: "PUT_JAZZ_ROLE_ID_HERE" },
  { name: "Washington Wizards", roleId: "PUT_WIZARDS_ROLE_ID_HERE" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("sign")
    .setDescription("Sign a player to a team")
    .addUserOption(option =>
      option.setName("player").setDescription("Player to sign").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("team").setDescription("Example: New York Knicks").setRequired(true)
    ),

  async execute(interaction) {
    const hasPermission =
      interaction.member.roles.cache.has(HEAD_COACH_ROLE_ID) ||
      interaction.member.roles.cache.has(GENERAL_MANAGER_ROLE_ID);

    if (!hasPermission) {
      return interaction.reply({
        content: "❌ You need the Head Coach or General Manager role to sign players.",
        ephemeral: true,
      });
    }

    const player = interaction.options.getMember("player");
    const teamName = interaction.options.getString("team");

    const team = NBA_TEAMS.find(
      t => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (!team) {
      return interaction.reply({
        content: "❌ Team not found. Make sure you typed the full team name.",
        ephemeral: true,
      });
    }

    const alreadyOnTeam = NBA_TEAMS.find(t => player.roles.cache.has(t.roleId));

    if (alreadyOnTeam) {
      return interaction.reply({
        content: `❌ ${player} is already on **${alreadyOnTeam.name}**. Release them first.`,
        ephemeral: true,
      });
    }

    await player.roles.add([PLAYER_ROLE_ID, team.roleId]);
    await player.roles.remove(FREE_AGENT_ROLE_ID).catch(() => null);

    await interaction.guild.members.fetch();

    const teamRole = interaction.guild.roles.cache.get(team.roleId);
    const rosterCount = teamRole ? teamRole.members.size : "Unknown";

    await interaction.reply({
      content: `✅ ${player} has signed with **${team.name}**!\nRoster Count: **${rosterCount}/15**`,
    });
  },
};



