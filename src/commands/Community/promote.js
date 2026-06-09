import { SlashCommandBuilder } from "discord.js";

const HEAD_COACH_ROLE_ID = "1512331578775310366";
const PLAYER_ROLE_ID = "1512331841179353118";
const ASSISTANT_COACH_ROLE_ID = "1512331689035304960";
const TRANSACTIONS_CHANNEL_ID = "1512328699066978455";

const NBA_TEAMS = [
  { name: "Atlanta Hawks", roleId: "1512517955303379007" },
  { name: "Boston Celtics", roleId: "1512518103861301258" },
  { name: "Brooklyn Nets", roleId: "1512518153601552636" },
  { name: "Charlotte Hornets", roleId: "1512518241413627914" },
  { name: "Chicago Bulls", roleId: "1512518314327277749" },
  { name: "Cleveland Cavaliers", roleId: "1512518366529716225" },
  { name: "Dallas Mavericks", roleId: "1512518548579422258" },
  { name: "Denver Nuggets", roleId: "1512518893502205992" },
  { name: "Detroit Pistons", roleId: "1512932453491151020" },
  { name: "Golden State Warriors", roleId: "1512932556172034180" },
  { name: "Houston Rockets", roleId: "1512932606767792298" },
  { name: "Indiana Pacers", roleId: "1512932703823990845" },
  { name: "LA Clippers", roleId: "1512932788699922523" },
  { name: "Los Angeles Lakers", roleId: "1512932857763594301" },
  { name: "Memphis Grizzlies", roleId: "1512932929540718724" },
  { name: "Miami Heat", roleId: "1512932993751318590" },
  { name: "Milwaukee Bucks", roleId: "1512933063183564860" },
  { name: "Minnesota Timberwolves", roleId: "1512933150328750170" },
  { name: "New Orleans Pelicans", roleId: "1512933198181568653" },
  { name: "New York Knicks", roleId: "1512933266993184898" },
  { name: "Oklahoma City Thunder", roleId: "1512933332818726933" },
  { name: "Orlando Magic", roleId: "1512933391677395075" },
  { name: "Philadelphia 76ers", roleId: "1512933510837567589" },
  { name: "Phoenix Suns", roleId: "1512933553334390844" },
  { name: "Portland Trail Blazers", roleId: "1512933621865124062" },
  { name: "Sacramento Kings", roleId: "1512933667901669437" },
  { name: "San Antonio Spurs", roleId: "1512933740635230269" },
  { name: "Toronto Raptors", roleId: "1512933819299266683" },
  { name: "Utah Jazz", roleId: "1512933864627241111" },
  { name: "Washington Wizards", roleId: "1512933932742611134" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a player to Assistant Coach")
    .addUserOption(option =>
      option
        .setName("player")
        .setDescription("Player to promote")
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = interaction.options.getMember("player");

    const hasHeadCoachRole = interaction.member.roles.cache.has("1512331578775310366");

    if (!hasHeadCoachRole) {
      return interaction.reply({
        content: "❌ You must have the Head Coach role to promote players.",
        ephemeral: true,
      });
    }

    const coachTeam = NBA_TEAMS.find(team =>
      interaction.member.roles.cache.has(team.roleId)
    );

    if (!coachTeam) {
      return interaction.reply({
        content: "❌ You must have your team role to promote players.",
        ephemeral: true,
      });
    }

    const freshPlayer = await interaction.guild.members.fetch(player.id);

    if (!freshPlayer.roles.cache.has("1512331841179353118")) {
      return interaction.reply({
        content: `❌ ${freshPlayer} does not have the Player role.`,
        ephemeral: true,
      });
    }

    if (!freshPlayer.roles.cache.has(coachTeam.roleId)) {
      return interaction.reply({
        content: `❌ ${freshPlayer} is not on **${coachTeam.name}**.`,
        ephemeral: true,
      });
    }

    if (freshPlayer.roles.cache.has("1512331689035304960")) {
      return interaction.reply({
        content: `❌ ${freshPlayer} is already an Assistant Coach.`,
        ephemeral: true,
      });
    }

    try {
      await freshPlayer.roles.add("1512331689035304960");
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: "❌ I could not add the Assistant Coach role. Check my role permissions.",
        ephemeral: true,
      });
    }

    const transactionsChannel = interaction.guild.channels.cache.get("1512328699066978455");

    if (transactionsChannel) {
      await transactionsChannel.send(
        `⬆️ **PROMOTION:** ${freshPlayer} has been promoted to Assistant Coach for **${coachTeam.name}**.\nProcessed by: ${interaction.user}`
      );
    }

    return interaction.reply({
      content: `⬆️ ${freshPlayer} has been promoted to Assistant Coach for **${coachTeam.name}**.`,
    });
  },
};
